$(document).ready(function () {

  const START_YEAR = 2022;
  const CURRENT_YEAR = new Date().getFullYear();
  const TYPES = ['photos', 'videos', 'youtube'];

  const yearTabs = $('#year-tabs');
  const galleryContent = $('#gallery-content');

  function loadYear(type, year) {
    return $.getJSON(`/gallery/data/${type}-${year}.json`)
      .then(data => (Array.isArray(data) && data.length ? data : []))
      .catch(() => []);
  }

  async function findValidYears() {
    const validYears = [];

    for (let year = CURRENT_YEAR; year >= START_YEAR; year--) {

      let hasContent = false;

      for (let type of TYPES) {
        const data = await loadYear(type, year);
        if (data.length) {
          hasContent = true;
          break;
        }
      }

      if (hasContent) validYears.push(year);
    }

    return validYears;
  }

  function creditPrefix(type, value) {
    if (!value) return '';
    return type === 'photos'
      ? `Photo by ${value}`
      : `Video by ${value}`;
  }

  async function buildYear(year) {

    galleryContent.html('<div class="loading">Loading...</div>');
    const allData = {};

    for (let type of TYPES) {
      allData[type] = await loadYear(type, year);
    }

    galleryContent.empty();

    TYPES.forEach(type => {

      if (!allData[type].length) return;

      const section = $(`
        <section class="gallery-section">
          <h2>${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
          <div class="album-grid"></div>
        </section>
      `);

      const grid = section.find('.album-grid');

      allData[type].forEach(album => {

        let coverHTML = '';
        const itemCount = album.items.length;

        if (type === 'youtube') {
          const firstVideo = album.items[0];
          coverHTML = `
            <div class="album-media-wrapper">
              <img src="https://img.youtube.com/vi/${firstVideo.youtubeID}/hqdefault.jpg" />
              <div class="album-count">${itemCount}</div>
            </div>
          `;
        } else {
          const cover = album.items[0];
          coverHTML = `
            <div class="album-media-wrapper">
              <img src="${cover.file}" />
              <div class="album-count">${itemCount}</div>
            </div>
          `;
        }

        const card = $(`
          <div class="album-card">
            ${coverHTML}
            <div class="album-info">
              <h3>${album.title}</h3>
              ${album.description ? `<p>${album.description}</p>` : ''}
              ${album.sourcecredit ? `<p class="source">${creditPrefix(type, album.sourcecredit)}</p>` : ''}
            </div>
          </div>
        `);

        card.on('click', () => openAlbum(year, type, album));
        grid.append(card);
      });

      galleryContent.append(section);
    });

  }

  function openAlbum(year, type, album) {

    galleryContent.html('');

    const wrapper = $(`
      <div class="album-view">
        <button class="back-button">← Back to ${year}</button>
        <h2>${album.title}</h2>
        ${album.description ? `<p>${album.description}</p>` : ''}
        ${album.sourcecredit ? `<p class="source">${creditPrefix(type, album.sourcecredit)}</p>` : ''}
        <div class="media-grid"></div>
      </div>
    `);

    wrapper.find('.back-button').on('click', () => buildYear(year));
    const grid = wrapper.find('.media-grid');

    album.items.forEach(item => {

      if (type === 'youtube') {

        grid.append(`
          <div class="media-card">
            <iframe width="100%" height="250"
              src="https://www.youtube.com/embed/${item.youtubeID}"
              frameborder="0"
              allowfullscreen>
            </iframe>
            <h4>${item.title || ''}</h4>
            ${item.description ? `<p>${item.description}</p>` : ''}
            ${item.sourcecredit ? `<p class="source">${creditPrefix(type, item.sourcecredit)}</p>` : ''}
          </div>
        `);

      } else {

        const card = $('<div class="media-card"></div>');

        const link = $(`
          <a href="${item.file}" class="glightbox"
            data-title="${item.title || ''}"
            data-description="${item.description || ''}<br><em>${creditPrefix(type, item.sourcecredit)}</em>">
            <img src="${item.file}">
          </a>
        `);

        card.append(link);
        card.append(`<h4>${item.title || ''}</h4>`);
        if (item.description) card.append(`<p>${item.description}</p>`);
        if (item.sourcecredit) card.append(`<p class="source">${creditPrefix(type, item.sourcecredit)}</p>`);

        grid.append(card);
      }

    });

    galleryContent.append(wrapper);

    GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: false
    });

  }

  (async function init() {

    const validYears = await findValidYears();
    if (!validYears.length) return;

    validYears.forEach((year, index) => {

      const btn = $(`<button class="year-tab ${index === 0 ? 'active-year' : ''}">${year}</button>`);

      btn.on('click', function () {
        $('.year-tab').removeClass('active-year');
        $(this).addClass('active-year');
        buildYear(year);
      });

      yearTabs.append(btn);
    });

    buildYear(validYears[0]);

  })();

});