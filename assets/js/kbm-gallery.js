$(document).ready(function () {

  const START_YEAR = 2022;
  const CURRENT_YEAR = new Date().getFullYear();

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
    promises.push(loadYearGallery(year, 'photos'));
    promises.push(loadYearGallery(year, 'videos'));
  }
  const ytPromise = loadJSONFile('youtube.json');
  const igPromise = loadJSONFile('instagram.json');

  Promise.all([...promises, ytPromise, igPromise]).then(results => {

    // Handle Photos & Videos with tabs
    ['photos','videos'].forEach(type => {
      const sectionResults = results.filter(r => r && r.year && r.type === type);
      if(!sectionResults.length) return;

      const tabsContainer = $(`#${type}-year-tabs`);
      const contentContainer = $(`#${type}-year-content`);

      sectionResults.sort((a,b) => b.year - a.year); // newest first

      // Build tabs
      sectionResults.forEach((yrObj, idx) => {
        const activeClass = (yrObj.year === CURRENT_YEAR) ? 'active-year' : '';
        tabsContainer.append(`<button class="year-tab ${activeClass}" data-year="${yrObj.year}">${yrObj.year}</button>`);

        // Build hidden container for each year
        const galleryDivID = `${type}-gallery-${yrObj.year}`;
        contentContainer.append(`<div class="year-gallery" id="${galleryDivID}" style="display:${activeClass ? 'block':'none'}"></div>`);

        // Build NanoGallery items
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
              kind: type==='videos' ? 'video':'image'
            });
          });
        });

        $(`#${galleryDivID}`).nanogallery2({
          items,
          thumbnailHeight: 250,
          thumbnailWidth: 'auto',
          thumbnailGutterWidth: 15,
          thumbnailGutterHeight: 15,
          galleryDisplayMode: 'rows',
          thumbnailLabel: { position: 'overImageOnBottom', display: true },
          locationHash: false
        });

      });

      // Tab click handler
      $(`#${type}-year-tabs`).on('click', '.year-tab', function(){
        const selectedYear = $(this).data('year');
        $(`#${type}-year-content .year-gallery`).hide();
        $(`#${type}-gallery-${selectedYear}`).show();
        $(`#${type}-year-tabs .year-tab`).removeClass('active-year');
        $(this).addClass('active-year');
      });
    });

    // YouTube
    const ytData = results[results.length - 2] || [];
    if (ytData.length) {
      const ytContainer = $('#youtube-gallery');
      ytData.forEach(video => {
        ytContainer.append(`
          <div class="media-item">
            <iframe width="350" height="200"
              src="https://www.youtube.com/embed/${video.youtubeID}"
              frameborder="0" allowfullscreen></iframe>
            <p>${video.title}</p>
          </div>
        `);
      });
    }

    // Instagram
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