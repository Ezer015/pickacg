class AnimeSearch {
    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTags = urlParams.get('tags')?.split(',').filter(Boolean) || [];

        this.state = {
            tags: new Set(urlTags),
            isLoading: false,
            hasMore: true,
            offset: 0,
            limit: 20,
            currentSearchData: null,
            lastScroll: Date.now()
        };

        this.elements = {
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
            themeToggle: document.getElementById('themeToggle'),
            contentType: document.getElementById('contentType')
        };

        this.initializeTheme();
        this.initializeTags();
        this.initializeSort();
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

    initializeTags() {
        Array.from(this.state.tags).forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                <span class="tag-text">${tag}</span>
                <span class="tag-remove" data-tag="${tag}">×</span>
            `;
            this.elements.tagContainer.appendChild(tagElement);
        });
    }

    initializeSort() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlSort = urlParams.get('sort');
        if (urlSort) {
            this.elements.sortButtons.forEach(btn => {
                if (btn.dataset.sort === urlSort) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                }
            });
        }

        // Update URL if parameters were provided
        if (window.location.search) {
            this.updateURL();
        }
    }

    updateURL() {
        const params = new URLSearchParams();

        // Add tags to URL if any exist
        const tags = Array.from(this.state.tags);
        if (tags.length > 0) {
            params.set('tags', tags.join(','));
        }

        // Add sort to URL if it's not the default
        const activeSort = document.querySelector('.segmented-button.active')?.dataset.sort;
        if (activeSort) {
            params.set('sort', activeSort);
        }

        // Update URL without reloading the page
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.pushState({}, '', newUrl);
    }

    setupEventListeners() {
        this.elements.keyword.addEventListener('keypress', e => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                const input = e.target.value.trim();
                if (input.startsWith('Bearer')) {
                    if (input.length > 'Bearer '.length) {
                        localStorage.setItem('auth_token', input);
                    } else {
                        localStorage.removeItem('auth_token');
                    }
                } else {
                    this.addTag(input);
                }
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
                this.updateURL();
                this.resetSearch();
            });
        });

        // Type select functionality
        const typeSelectWrapper = document.querySelector('.type-select-wrapper');
        const typeSelect = this.elements.contentType;
        const typeOptions = typeSelectWrapper.querySelector('.type-select-options');
        const typeIcon = typeSelectWrapper.querySelector('.type-select-icon');

        // Handle clicking the wrapper to open/close dropdown
        typeSelectWrapper.addEventListener('click', (e) => {
            if (e.target.closest('.type-select-options')) return;
            typeSelectWrapper.classList.toggle('open');
            e.stopPropagation();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            typeSelectWrapper.classList.remove('open');
        });

        // Handle option selection
        typeOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.type-select-option');
            if (!option) return;

            // Remove selection from all options
            typeOptions.querySelectorAll('.type-select-option').forEach(opt => {
                opt.classList.remove('selected');
            });

            // Add selection to clicked option
            option.classList.add('selected');

            // Update hidden select and icon
            typeSelect.value = option.dataset.value;
            typeIcon.textContent = option.textContent;

            // Close dropdown and trigger search
            typeSelectWrapper.classList.remove('open');
            this.resetSearch();
        });

        // Handle keyboard navigation
        typeSelectWrapper.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                typeSelectWrapper.classList.toggle('open');
            } else if (e.key === 'Escape') {
                typeSelectWrapper.classList.remove('open');
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const options = Array.from(typeOptions.children);
                const currentIndex = options.findIndex(opt => opt.classList.contains('selected'));
                let newIndex = currentIndex;

                if (e.key === 'ArrowDown') {
                    newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                } else {
                    newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                }

                // Remove selection from all options
                options.forEach(opt => opt.classList.remove('selected'));

                // Add selection to new option
                options[newIndex].classList.add('selected');
                typeSelect.value = options[newIndex].dataset.value;
                typeIcon.textContent = options[newIndex].textContent;
                this.resetSearch();
            }
        });

        // Initialize with selected option and ensure UI sync
        const initSelectedOption = typeOptions.querySelector(`[data-value="${typeSelect.value}"]`);
        if (initSelectedOption) {
            // Clear any existing selections
            typeOptions.querySelectorAll('.type-select-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            // Set current selection
            typeIcon.textContent = initSelectedOption.textContent;
            initSelectedOption.classList.add('selected');
            // Ensure hidden select matches
            typeSelect.value = initSelectedOption.dataset.value;
        }

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
        if (now - this.state.lastScroll < 200) return;
        this.state.lastScroll = now;

        const { scrollY, innerHeight } = window;
        const { scrollHeight } = document.documentElement;

        if (scrollHeight - (scrollY + innerHeight) <= 1600 &&
            !this.state.isLoading &&
            this.state.hasMore &&
            this.state.currentSearchData) {
            this.loadMoreResults();
        }
    }

    createSearchData() {
        const filter = { type: [parseInt(this.elements.contentType.value)] };

        if (this.state.tags.size) {
            filter.tag = Array.from(this.state.tags);
            if (filter.tag.some(t => t.toLowerCase() === 'nsfw')) {
                filter.tag = filter.tag.filter(t => t.toLowerCase() !== 'nsfw');
                filter.nsfw = true;
            }
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
                    <div class="progress-bar">
                        <div class="progress-bar-fill"></div>
                    </div>
                    Loading...
                </div>`;
            this.state.currentSearchData = this.createSearchData();
        }

        try {
            // Add loading indicator if loading more results
            if (!resetResults) {
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'loading';
                loadingDiv.innerHTML = `
                    <div class="progress-bar">
                        <div class="progress-bar-fill"></div>
                    </div>
                    Loading...
                `;
                this.elements.resultsContainer.appendChild(loadingDiv);
            }

            const url = new URL('https://api.bgm.tv/v0/search/subjects');
            url.searchParams.set('limit', this.state.limit);
            url.searchParams.set('offset', this.state.offset);

            const authToken = localStorage.getItem('auth_token');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': authToken })
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
                // Collect common tags
                const tagCounts = new Map();
                data.data.forEach(anime => {
                    if (anime.tags) {
                        anime.tags.forEach(tag => {
                            const count = tagCounts.get(tag.name) || 0;
                            tagCounts.set(tag.name, count + 1);
                        });
                    }
                });

                // Sort tags by frequency and get tops
                const commonTags = Array.from(tagCounts.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 30)
                    .map(([tag]) => tag);

                this.elements.resultsContainer.innerHTML = data.total ?
                    `<div class="results-summary">
                        <span class="results-summary-title">Pick <strong>${data.total}</strong> Results From</span>
                        </span>
                        ${commonTags.length ?
                        `<span class="anime-tags">
                                ${commonTags.map(tag =>
                            `<span class="anime-tag" data-tag="${tag}">${tag}</span>`
                        ).join('')}
                            </span>` : ''
                    }
                    </div>` : '';

                // Add click handlers for common tags
                this.elements.resultsContainer.querySelectorAll('.anime-tag').forEach(tag => {
                    tag.addEventListener('click', () => this.addTag(tag.dataset.tag));
                });
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

        } catch (error) {
            console.error('Search error:', error);
            if (resetResults) {
                this.elements.resultsContainer.innerHTML =
                    '<div class="no-results">An error occurred while searching. Please try again.</div>';
            }
            throw error;
        } finally {
            const loadingIndicator = this.elements.resultsContainer.querySelector('.loading');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            this.state.isLoading = false;
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
        const card = document.createElement('a');
        card.className = 'anime-card';
        card.dataset.id = anime.id;
        card.style.cursor = 'pointer';

        card.href = `https://bgm.tv/subject/${anime.id}`;
        card.target = '_blank';
        card.style.textDecoration = 'none';

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

        // Add context menu
        const menuHTML = `
            <div class="anime-card-menu">
                <button class="anime-card-menu-btn">
                    <span class="material-symbols-rounded">more_vert</span>
                </button>
                <div class="anime-card-menu-content">
                    <div class="anime-card-menu-item" data-action="copy-title">Copy Title</div>
                    ${anime.name_cn ? `<div class="anime-card-menu-item" data-action="copy-subtitle">Copy Subtitle</div>` : ''}
                </div>
            </div>
        `;
        card.insertAdjacentHTML('beforeend', menuHTML);

        card.innerHTML += `
            <div class="anime-info" data-title="${anime.name_cn || anime.name}" data-subtitle="${anime.name_cn ? anime.name : ''}">
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
        // Add menu event listeners
        const menuBtn = card.querySelector('.anime-card-menu-btn');
        const menuContent = card.querySelector('.anime-card-menu-content');

        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Hide other menus
            document.querySelectorAll('.anime-card-menu-content').forEach(content => {
                if (content !== menuContent) content.classList.remove('show');
            });
            menuContent.classList.toggle('show');
        });

        // Hide menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuContent.contains(e.target) && !menuBtn.contains(e.target)) {
                menuContent.classList.remove('show');
            }
        });

        card.querySelectorAll('.anime-card-menu-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                menuContent.classList.remove('show');

                const info = card.querySelector('.anime-info');
                try {
                    if (e.target.dataset.action === 'copy-title') {
                        await navigator.clipboard.writeText(info.dataset.title);
                    } else if (e.target.dataset.action === 'copy-subtitle' && info.dataset.subtitle) {
                        await navigator.clipboard.writeText(info.dataset.subtitle);
                    }
                } catch (err) {
                    console.error('Failed to copy text:', err);
                }
            });
        });

        card.querySelectorAll('.anime-tag').forEach(tagElement => {
            tagElement.addEventListener('click', (e) => {
                e.preventDefault();
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
        this.updateURL();
    }

    removeTag(tag) {
        if (!this.state.tags.has(tag)) return;
        this.state.tags.delete(tag);
        this.elements.tagContainer.querySelectorAll('.tag').forEach(el => {
            if (el.querySelector('.tag-text').textContent === tag) el.remove();
        });
        this.updateURL();
    }
}

document.addEventListener('DOMContentLoaded', () => new AnimeSearch());
