$(document).ready(function () {

  const START_YEAR = 2022;
  const CURRENT_YEAR = new Date().getFullYear();

  const galleryContainer = $('#gallery-sections');

  // Helper function to load JSON for a year
  function loadYearGallery(year, type) {
    return $.getJSON(`/gallery/data/${type}-${year}.json`).then(data => {
      return data.length ? { year, type, data } : null;
    }).catch(() => null); // fail silently if file doesn't exist
  }

  // Load YouTube & Instagram
  function loadJSONFile(file) {
    return $.getJSON(`/gallery/data/${file}`).catch(() => []);
  }

  // Build all years dynamically
  const promises = [];
  for (let year = CURRENT_YEAR; year >= START_YEAR; year--) {
    promises.push(loadYearGallery(year, 'photos'));
    promises.push(loadYearGallery(year, 'videos'));
  }

  // Load YouTube & Instagram separately
  const ytPromise = loadJSONFile('youtube.json');
  const igPromise = loadJSONFile('instagram.json');

  Promise.all([...promises, ytPromise, igPromise]).then(results => {

    // Separate out year galleries
    const yearGalleries = results.filter(r => r && r.year);

    // Photos and Videos
    yearGalleries.forEach(g => {
      const section = $(`
        <section class="gallery-year">
          <h2>${g.type.charAt(0).toUpperCase() + g.type.slice(1)} – ${g.year}</h2>
          <div id="${g.type}-gallery-${g.year}" class="nanogallery2"></div>
        </section>
      `);
      galleryContainer.append(section);

      const items = [];
      g.data.forEach(album => {
        // Album cover is first image/video
        items.push({
          src: '',
          srct: album.items[0].file,
          title: album.title,
          description: album.description,
          ID: Math.random().toString(36).substr(2,9),
          kind: 'album'
        });

        album.items.forEach(i => {
          items.push({
            src: i.file,
            srct: i.file,
            title: i.title,
            description: i.description,
            albumID: items[0].ID,
            customData: { alt: i.title + " - " + i.description },
            kind: g.type === 'videos' ? 'video' : 'image'
          });
        });
      });

      $(`#${g.type}-gallery-${g.year}`).nanogallery2({
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

    // YouTube
    const ytData = results[results.length - 2] || [];
    const ytContainer = $('<section><h2>YouTube</h2><div class="media-grid" id="youtube-gallery"></div></section>');
    galleryContainer.append(ytContainer);
    ytData.forEach(video => {
      $('#youtube-gallery').append(`
        <div class="media-item">
          <iframe width="350" height="200"
            src="https://www.youtube.com/embed/${video.youtubeID}"
            frameborder="0" allowfullscreen></iframe>
          <p>${video.title}</p>
        </div>
      `);
    });

    // Instagram
    const igData = results[results.length - 1] || [];
    const igContainer = $('<section><h2>Instagram</h2><div class="media-grid" id="instagram-gallery"></div></section>');
    galleryContainer.append(igContainer);
    igData.forEach(post => {
      $('#instagram-gallery').append(`
        <blockquote class="instagram-media">
          <a href="${post.url}" target="_blank">${post.title}</a>
          <p>${post.description}</p>
        </blockquote>
      `);
    });

  }).catch(err => console.error('Gallery load error:', err));

});