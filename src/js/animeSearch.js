class AnimeSearch {
    constructor() {
        this.state = {
            tags: new Set(),
            isLoading: false,
            hasMore: true,
            offset: 0,
            limit: 20,
            currentSearchData: null,
            lastScroll: Date.now()
        };

        this.elements = {
            tagInput: document.getElementById('tagInput'),
            searchBtn: document.getElementById('searchBtn'),
            tagContainer: document.getElementById('tagContainer'),
            resultsContainer: document.getElementById('results'),
            keyword: document.getElementById('keyword'),
            minRating: document.getElementById('minRating'),
            maxRating: document.getElementById('maxRating'),
            startDate: document.getElementById('startDate'),
            endDate: document.getElementById('endDate'),
            minRank: document.getElementById('minRank'),
            maxRank: document.getElementById('maxRank'),
            sortButtons: document.querySelectorAll('.segmented-button'),
            themeToggle: document.getElementById('themeToggle')
        };

        this.initializeTheme();
        this.setupEventListeners();
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.elements.themeToggle.querySelector('.material-symbols-rounded').textContent =
            savedTheme === 'dark' ? 'dark_mode' : 'light_mode';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        this.elements.themeToggle.querySelector('.material-symbols-rounded').textContent =
            newTheme === 'dark' ? 'dark_mode' : 'light_mode';
    }

    setupEventListeners() {
        this.elements.tagInput.addEventListener('keypress', e => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                this.addTag(e.target.value.trim());
                e.target.value = '';
            }
        });

        this.elements.searchBtn.addEventListener('click', () => this.resetSearch());
        this.elements.tagContainer.addEventListener('click', e => {
            if (e.target.classList.contains('tag-remove')) {
                this.removeTag(e.target.dataset.tag);
            }
        });

        this.elements.sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.elements.sortButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
                this.resetSearch();
            });
        });

        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.debounce = (fn, delay) => {
            let timeoutId;
            return () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(fn.bind(this), delay);
            };
        };

        this.debouncedResetSearch = this.debounce(() => this.resetSearch(), 300);

        window.addEventListener('scroll', this.debounce(() => this.checkScroll(), 50));
        window.addEventListener('resize', this.debounce(() => this.checkScroll(), 100));
    }

    checkScroll() {
        const now = Date.now();
        if (now - this.state.lastScroll < 250) return;
        this.state.lastScroll = now;

        const { scrollY, innerHeight } = window;
        const { scrollHeight } = document.documentElement;

        if (scrollHeight - (scrollY + innerHeight) <= 200 &&
            !this.state.isLoading &&
            this.state.hasMore &&
            this.state.currentSearchData) {
            this.loadMoreResults();
        }
    }

    createSearchData() {
        const filter = { type: [2] };

        if (this.state.tags.size) {
            filter.tag = Array.from(this.state.tags);
        }

        const addFilter = (field, min, max) => {
            if (min.value || max.value) {
                filter[field] = [];
                if (min.value) filter[field].push(`>${min.value}`);
                if (max.value) filter[field].push(`<=${max.value}`);
            }
        };

        const { minRating, maxRating, minRank, maxRank, startDate, endDate } = this.elements;
        addFilter('rating', minRating, maxRating);

        // If sort is rank and no min rank is set, default to 0 to show ranked items first
        if (document.querySelector('.segmented-button.active').dataset.sort === 'rank' && !minRank.value) {
            filter.rank = ['>0'];
            if (maxRank.value) filter.rank.push(`<=${maxRank.value}`);
        } else {
            addFilter('rank', minRank, maxRank);
        }

        addFilter('air_date', startDate, endDate);

        return {
            keyword: this.elements.keyword.value.trim(),
            sort: document.querySelector('.segmented-button.active').dataset.sort,
            filter
        };
    }

    async performSearch(resetResults = false) {
        if (this.state.isLoading) return;
        this.state.isLoading = true;

        if (resetResults) {
            this.elements.resultsContainer.innerHTML = `
                <div class="loading">
                    Loading results...
                    <div class="progress-bar">
                        <div class="progress-bar-fill"></div>
                    </div>
                </div>`;
            this.state.currentSearchData = this.createSearchData();
        }

        try {
            const url = new URL('https://api.bgm.tv/v0/search/subjects');
            url.searchParams.set('limit', this.state.limit);
            url.searchParams.set('offset', this.state.offset);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state.currentSearchData)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (!data.data?.length) {
                this.state.hasMore = false;
                if (resetResults) {
                    this.elements.resultsContainer.innerHTML = `
                        <div class="no-results">
                            <span class="material-symbols-rounded">search_off</span>
                            <h2>No results found</h2>
                            <p>Try adjusting your search criteria or using different tags</p>
                        </div>`;
                }
                return;
            }

            if (resetResults) {
                this.elements.resultsContainer.innerHTML = data.total ?
                    `<div class="results-summary">Found ${data.total} results</div>` : '';
            }

            const existingIds = new Set(
                Array.from(this.elements.resultsContainer.querySelectorAll('.anime-card'))
                    .map(card => card.dataset.id)
            );

            data.data
                .filter(anime => !existingIds.has(anime.id.toString()))
                .forEach(anime => this.elements.resultsContainer.appendChild(this.createAnimeCard(anime)));

            this.state.offset += data.data.length;
            this.state.hasMore = this.state.offset < data.total;

            if (this.state.hasMore) {
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'loading';
                loadingDiv.innerHTML = `
                    Loading more results...
                    <div class="progress-bar">
                        <div class="progress-bar-fill"></div>
                    </div>
                `;
                this.elements.resultsContainer.appendChild(loadingDiv);
            }

        } catch (error) {
            console.error('Search error:', error);
            if (resetResults) {
                this.elements.resultsContainer.innerHTML =
                    '<div class="no-results">An error occurred while searching. Please try again.</div>';
            }
            throw error;
        } finally {
            this.state.isLoading = false;
            const loadingIndicator = this.elements.resultsContainer.querySelector('.loading');
            if (loadingIndicator) loadingIndicator.remove();
        }
    }

    async loadMoreResults(attempt = 1) {
        const { hasMore, isLoading } = this.state;
        if (!hasMore || isLoading) return;

        try {
            await this.performSearch(false);
        } catch (error) {
            if (attempt < 3) {
                setTimeout(() => this.loadMoreResults(attempt + 1), attempt * 1000);
            }
        }
    }

    createAnimeCard(anime) {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.dataset.id = anime.id;
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            window.open(`https://bgm.tv/subject/${anime.id}`, '_blank');
        });

        const sortedTags = anime.tags ? anime.tags
            .sort((a, b) => b.count - a.count)
            .map(tag => tag.name) : [];

        const imageUrl = anime.images?.common;
        const imgContainer = document.createElement('div');
        imgContainer.className = 'anime-image-container';

        const rank = anime.rating?.rank ? `<div class="anime-rank">#${anime.rating.rank}</div>` : '';
        const rating = anime.rating?.score ?
            `<div class="anime-rating-badge">${Number.isInteger(anime.rating.score) ? anime.rating.score + '.0' : anime.rating.score}</div>` : '';

        imgContainer.innerHTML = `
            ${imageUrl ? `
                <img 
                    src="${imageUrl}" 
                    alt="${anime.name}"
                    class="anime-image"
                    onerror="this.classList.add('no-image'); this.parentElement.querySelector('.placeholder-icon').style.display = 'block';"
                >
            ` : `
                <img 
                    src="#" 
                    alt="${anime.name}"
                    class="anime-image no-image"
                    hidden
                >
            `}
            <span class="material-symbols-rounded placeholder-icon" style="display: ${!imageUrl ? 'block' : 'none'}">image_not_supported</span>
            ${rank}
            ${rating}
        `;

        card.appendChild(imgContainer);
        card.innerHTML += `
            <div class="anime-info">
                <div class="anime-title">
                    ${anime.name_cn ? `
                        <div class="anime-title-main">${anime.name_cn}</div>
                        <div class="anime-title-sub">${anime.name}</div>
                    ` : `
                        <div class="anime-title-main">${anime.name}</div>
                    `}
                </div>
                <div class="anime-details">
                    <div class="anime-detail-item date">
                        <span class="material-symbols-rounded">calendar_month</span>
                        ${anime.date || 'TBA'}
                    </div>
                    <div class="anime-detail-item episodes">
                        <span class="material-symbols-rounded">video_library</span>
                        ${anime.eps || '?'} eps
                    </div>
                </div>
                <div class="anime-tags">
                    ${sortedTags.map(tag => `<span class="anime-tag" data-tag="${tag}">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        card.querySelectorAll('.anime-tag').forEach(tagElement => {
            tagElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addTag(e.currentTarget.dataset.tag);
            });
        });
        return card;
    }

    resetSearch() {
        this.state.offset = 0;
        this.state.hasMore = true;
        this.performSearch(true);
    }

    addTag(tag) {
        if (this.state.tags.has(tag)) return;
        this.state.tags.add(tag);

        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            <span class="tag-text">${tag}</span>
            <span class="tag-remove" data-tag="${tag}">×</span>
        `;
        this.elements.tagContainer.appendChild(tagElement);
    }

    removeTag(tag) {
        if (!this.state.tags.has(tag)) return;
        this.state.tags.delete(tag);
        this.elements.tagContainer.querySelectorAll('.tag').forEach(el => {
            if (el.querySelector('.tag-text').textContent === tag) el.remove();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new AnimeSearch());
