# Lites Demo Page Notes

This folder contains a simple browser-based demo for viewing EIDO Lites content.

## Main files

- `index.html`
  The packaged entry page. It loads the CSS and JavaScript assets and provides the page structure:
  - territory dropdown
  - document dropdown
  - index list on the left
  - rendered Lite content on the right

- `script/litedemo.js`
  The UI glue code. It:
  - requests the list of territories
  - requests the document list and index for the selected territory
  - triggers document fetch events
  - injects the selected document number into the dropdown and left-hand list state

- `script/EIDO_S3Document.js`
  The S3 integration layer. This is the important file for understanding how content is loaded.

## How it connects to S3

`EIDO_S3Document.js` uses the AWS browser SDK and makes unauthenticated requests directly to a public S3 bucket.

The key constants are:

- bucket: `inform-prod-lites`
- region: `eu-west-1`
- territory root: `Lites/#TERRITORY#/`
- document root: `Lites/#TERRITORY#/#DOCUMENT#/`
- Lite XML filename format: `#DOCUMENT#.xml`
- image root: `Lites/images`

In practice that means:

- territory index:
  - `Lites/UK/index.xml`
  - `Lites/AUS/index.xml`

- document XML:
  - `Lites/UK/A01/A01.xml`
  - `Lites/AUS/CA02/CA02.xml`

- PDF link:
  - built directly as an S3 URL for `#DOCUMENT#.pdf`

## Event flow

The page uses custom document events rather than calling S3 functions directly.

### Territory list

`litedemo.js` triggers:

`eidodoc:listterritories`

`EIDO_S3Document.js` responds by listing S3 prefixes under:

`Lites/`

This returns territory names such as `UK`, `AUS`, `CANADA`, `USA`, and others.

### Document list for a territory

`litedemo.js` triggers:

`eidodoc:listdocs`

with a territory value such as `UK`.

`EIDO_S3Document.js` then lists prefixes under:

`Lites/UK/`

and extracts document codes such as `A01`, `CA02`, `UG07`.

### Left-hand title index

`litedemo.js` triggers:

`eidodoc:index`

`EIDO_S3Document.js` fetches:

`Lites/<territory>/index.xml`

That XML contains the document numbers and titles used to build the clickable list.

### Document content

`litedemo.js` triggers:

`eidodoc:fetch`

`EIDO_S3Document.js` fetches:

`Lites/<territory>/<docnum>/<docnum>.xml`

The response body is treated as HTML/XML markup and injected into the target element on the page.

## Images

Images inside the Lite content are not left as normal `<img src="...">` references.

The script:

1. rewrites `src=` to `_src=` before injecting the document
2. reads the image filename from `_src`
3. fetches the matching asset from `Lites/images`
4. inserts the returned SVG/image markup into the page

This avoids broken image URLs and keeps image loading under the same S3 access pattern.

## Current behaviour we know about

- The page depends on:
  - `jquery-3.1.1.min.js`
  - `bootstrap.min.js`
  - AWS SDK for JavaScript

- The packaged page now uses valid HTML5 markup.

- The default territory in `script/litedemo.js` has been changed to `UK`.

- The right-hand content panel scroll issue was patched by making `.docviewer` the real scroll container instead of relying on a nested `.content` element.

## Useful example URLs

These are representative examples of what the page fetches:

- `https://inform-prod-lites.s3-eu-west-1.amazonaws.com/Lites/UK/index.xml`
- `https://inform-prod-lites.s3-eu-west-1.amazonaws.com/Lites/UK/A01/A01.xml`
- `https://inform-prod-lites.s3-eu-west-1.amazonaws.com/Lites/UK/A01/A01.pdf`

## Summary

This page is a thin client over a public S3-backed Lite document library.

The UI layer lives in `litedemo.js`.
The data access and S3 path conventions live in `EIDO_S3Document.js`.
The actual Lite content is stored remotely as XML plus images and PDFs in the `inform-prod-lites` bucket.
