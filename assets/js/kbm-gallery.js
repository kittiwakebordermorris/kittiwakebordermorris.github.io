$(document).ready(function () {

  const START_YEAR = 2022;
  const CURRENT_YEAR = new Date().getFullYear();
  const TYPES_WITH_TABS = ['photos', 'videos', 'youtube'];

  /* ---------------------------
     Helper: Load Year JSON
  ---------------------------- */
  function loadYearGallery(year, type) {
    return $.getJSON(`/gallery/data/${type}-${year}.json`)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          return { year, type, data };
        }
        return null;
      })
      .catch(() => null); // Ignore missing files
  }

  /* ---------------------------
     Helper: Load Single JSON
  ---------------------------- */
  function loadJSONFile(file) {
    return $.getJSON(`/gallery/data/${file}`).catch(() => []);
  }

  /* ---------------------------
     Build Load Promises
  ---------------------------- */
  const promises = [];

  for (let year = CURRENT_YEAR; year >= START_YEAR; year--) {
    TYPES_WITH_TABS.forEach(type => {
      promises.push(loadYearGallery(year, type));
    });
  }

  const instagramPromise = loadJSONFile('instagram.json');

  /* ---------------------------
     Process All Loaded Data
  ---------------------------- */
  Promise.all([...promises, instagramPromise]).then(results => {

    /* ===============================
       HANDLE PHOTOS / VIDEOS / YOUTUBE
    ================================ */
    TYPES_WITH_TABS.forEach(type => {

      const sectionResults = results.filter(r => r && r.type === type);
      if (!sectionResults.length) return;

      // Sort newest first
      sectionResults.sort((a, b) => b.year - a.year);

      const tabsContainer = $(`#${type}-year-tabs`);
      const contentContainer = $(`#${type}-year-content`);

      // Default active year = newest year WITH content
      const defaultActiveYear = sectionResults[0].year;

      sectionResults.forEach((yrObj) => {

        const isActive = (yrObj.year === defaultActiveYear);
        const activeClass = isActive ? 'active-year' : '';

        /* ---- Build Tab Button ---- */
        tabsContainer.append(
          `<button class="year-tab ${activeClass}" data-year="${yrObj.year}">
            ${yrObj.year}
          </button>`
        );

        /* ---- Create Content Container ---- */
        const contentID = `${type}-gallery-${yrObj.year}`;

        contentContainer.append(
          `<div class="year-gallery" id="${contentID}" 
            style="display:${isActive ? 'block' : 'none'}">
          </div>`
        );

        /* =================================
           PHOTOS & VIDEOS (NanoGallery)
        ================================== */
        if (type === 'photos' || type === 'videos') {

          const items = [];

          yrObj.data.forEach(album => {

            if (!album.items || !album.items.length) return;

            const albumID = Math.random().toString(36).substr(2, 9);

            // Album cover (first item)
            items.push({
              src: '',
              srct: album.items[0].file,
              title: album.title,
              description: album.description || '',
              ID: albumID,
              kind: 'album'
            });

            // Album items
            album.items.forEach(i => {
              items.push({
                src: i.file,
                srct: i.file,
                title: i.title || '',
                description: i.description || '',
                albumID: albumID,
                customData: { 
                  alt: (i.title || '') + ' - ' + (i.description || '')
                },
                kind: type === 'videos' ? 'video' : 'image'
              });
            });

          });

          if (items.length) {
            $(`#${contentID}`).nanogallery2({
              items,
              thumbnailHeight: 250,
              thumbnailWidth: 'auto',
              thumbnailGutterWidth: 15,
              thumbnailGutterHeight: 15,
              galleryDisplayMode: 'rows',
              thumbnailLabel: { 
                position: 'overImageOnBottom', 
                display: true 
              },
              locationHash: false
            });
          }
        }

        /* =================================
           YOUTUBE (Album Format)
        ================================== */
        if (type === 'youtube') {

          yrObj.data.forEach(album => {

            if (!album.items || !album.items.length) return;

            const albumWrapper = $(`
              <div class="youtube-album">
                <h3>${album.title}</h3>
                ${album.description ? `<p>${album.description}</p>` : ''}
                <div class="media-grid"></div>
              </div>
            `);

            const grid = albumWrapper.find('.media-grid');

            album.items.forEach(video => {
              grid.append(`
                <div class="media-item">
                  <iframe width="350" height="200"
                    src="https://www.youtube.com/embed/${video.youtubeID}"
                    frameborder="0"
                    allowfullscreen>
                  </iframe>
                  <p>
                    <strong>${video.title || ''}</strong><br>
                    ${video.description || ''}
                  </p>
                </div>
              `);
            });

            $(`#${contentID}`).append(albumWrapper);
          });
        }

      });

      /* ---- Tab Click Handler ---- */
      tabsContainer.on('click', '.year-tab', function () {

        const selectedYear = $(this).data('year');

        contentContainer.find('.year-gallery').hide();
        contentContainer.find(`#${type}-gallery-${selectedYear}`).show();

        tabsContainer.find('.year-tab').removeClass('active-year');
        $(this).addClass('active-year');

      });

    });

    /* ===============================
       INSTAGRAM (No Tabs)
    ================================ */
    const instagramData = results[results.length - 1] || [];

    if (instagramData.length) {
      const igContainer = $('#instagram-gallery');

      instagramData.forEach(post => {
        igContainer.append(`
          <blockquote class="instagram-media">
            <a href="${post.url}" target="_blank">
              ${post.title || ''}
            </a>
            ${post.description ? `<p>${post.description}</p>` : ''}
          </blockquote>
        `);
      });
    }

  }).catch(err => {
    console.error('Gallery load error:', err);
  });

});