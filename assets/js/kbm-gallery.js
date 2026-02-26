$(document).ready(function () {

  const START_YEAR = 2022;
  const CURRENT_YEAR = new Date().getFullYear();
  const TYPES_WITH_TABS = ['photos','videos','youtube'];

  function loadYearGallery(year, type) {
    return $.getJSON(`/gallery/data/${type}-${year}.json`).then(data => {
      return data.length ? { year, type, data } : null;
    }).catch(() => null);
  }

  function loadJSONFile(file) {
    return $.getJSON(`/gallery/data/${file}`).catch(() => []);
  }

  const promises = [];

  for (let year = CURRENT_YEAR; year >= START_YEAR; year--) {
    TYPES_WITH_TABS.forEach(type => {
      promises.push(loadYearGallery(year, type));
    });
  }

  const igPromise = loadJSONFile('instagram.json');

  Promise.all([...promises, igPromise]).then(results => {

    TYPES_WITH_TABS.forEach(type => {

      const sectionResults = results.filter(r => r && r.type === type);
      if (!sectionResults.length) return;

      sectionResults.sort((a,b) => b.year - a.year);

      const tabsContainer = $(`#${type}-year-tabs`);
      const contentContainer = $(`#${type}-year-content`);

      sectionResults.forEach((yrObj) => {

        const isActive = (yrObj.year === CURRENT_YEAR);
        const activeClass = isActive ? 'active-year' : '';

        tabsContainer.append(
          `<button class="year-tab ${activeClass}" data-year="${yrObj.year}">${yrObj.year}</button>`
        );

        const contentID = `${type}-gallery-${yrObj.year}`;

        contentContainer.append(
          `<div class="year-gallery" id="${contentID}" style="display:${isActive ? 'block':'none'}"></div>`
        );

        // Photos & Videos use NanoGallery
        if (type === 'photos' || type === 'videos') {

          const items = [];

          yrObj.data.forEach(album => {
            const albumID = Math.random().toString(36).substr(2,9);

            items.push({
              src: '',
              srct: album.items[0].file,
              title: album.title,
              description: album.description,
              ID: albumID,
              kind: 'album'
            });

            album.items.forEach(i => {
              items.push({
                src: i.file,
                srct: i.file,
                title: i.title,
                description: i.description,
                albumID: albumID,
                customData: { alt: i.title + ' - ' + i.description },
                kind: type === 'videos' ? 'video' : 'image'
              });
            });
          });

          $(`#${contentID}`).nanogallery2({
            items,
            thumbnailHeight: 250,
            thumbnailWidth: 'auto',
            thumbnailGutterWidth: 15,
            thumbnailGutterHeight: 15,
            galleryDisplayMode: 'rows',
            thumbnailLabel: { position: 'overImageOnBottom', display: true },
            locationHash: false
          });

        }

        // YouTube embeds
        if (type === 'youtube') {

          yrObj.data.forEach(video => {
            $(`#${contentID}`).append(`
              <div class="media-item">
                <iframe width="350" height="200"
                  src="https://www.youtube.com/embed/${video.youtubeID}"
                  frameborder="0" allowfullscreen></iframe>
                <p><strong>${video.title}</strong><br>${video.description}</p>
              </div>
            `);
          });

        }

      });

      // Tab switching
      tabsContainer.on('click', '.year-tab', function () {

        const selectedYear = $(this).data('year');

        contentContainer.find('.year-gallery').hide();
        contentContainer.find(`#${type}-gallery-${selectedYear}`).show();

        tabsContainer.find('.year-tab').removeClass('active-year');
        $(this).addClass('active-year');

      });

    });

    // Instagram (no tabs)
    const igData = results[results.length - 1] || [];
    if (igData.length) {
      const igContainer = $('#instagram-gallery');
      igData.forEach(post => {
        igContainer.append(`
          <blockquote class="instagram-media">
            <a href="${post.url}" target="_blank">${post.title}</a>
            <p>${post.description}</p>
          </blockquote>
        `);
      });
    }

  }).catch(err => console.error('Gallery load error:', err));

});