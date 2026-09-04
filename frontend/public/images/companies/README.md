# Company logos

    kraftshala.jpg      290x174  (wide — object-fit: contain letterboxes it)
    bws.jpg             200x200
    coding-blocks.jpg   200x200

Referenced from `constants/index.js` -> `expCards[].logoPath`.

`CompanyLogo` preloads each file and only swaps it in once it loads, falling
back to a lettered monogram otherwise — so replacing or renaming one of these
degrades to a designed mark rather than a broken image.
