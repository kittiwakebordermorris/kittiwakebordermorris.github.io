fetch('/gallery/gallery.json')
  .then(response => response.json())
  .then(data => {

    /* --------------------
       PHOTOS
    -------------------- */

    const photoItems = [];
    data.photos.sort((a, b) => new Date(b.date) - new Date(a.date));

    data.photos.forEach((album, index) => {

      const albumID = index + 1;
      const cover = album.folder + album.items[0].file;

      // Album entry
      photoItems.push({
        src: "",
        srct: cover,
        title: album.title,
        description: album.description,
        ID: albumID,
        kind: "album"
      });

      // Album contents
      album.items.forEach(item => {
        photoItems.push({
          src: album.folder + item.file,
          srct: album.folder + item.file,
          title: item.title,
          description: item.description,
          albumID: albumID,
          customData: {
            alt: item.title + " - " + item.description
          }
        });
      });

    });

    $("#photo-gallery").nanogallery2({
      items: photoItems,
      thumbnailHeight: 250,
      thumbnailWidth: "auto",
      thumbnailGutterWidth: 15,
      thumbnailGutterHeight: 15,
      galleryDisplayMode: "rows",
      thumbnailLabel: {
        position: "overImageOnBottom",
        display: true
      },
      viewerTools: {
        topLeft: "label",
        topRight: "fullscreenButton, closeButton"
      },
      locationHash: false
    });

  });