/**
 * Creates a minimal AEM block DOM structure for unit testing.
 * @param {string} blockName - CSS class(es) for the block element
 * @param {Array<Array<string>>} rows - Each inner array is a row of HTML strings per cell
 * @returns {HTMLElement} block element ready to pass to decorate()
 */
export function createBlockFixture(blockName, rows = []) {
  const block = document.createElement('div');
  block.className = blockName;
  rows.forEach((cells) => {
    const row = document.createElement('div');
    cells.forEach((cellHtml) => {
      const cell = document.createElement('div');
      cell.innerHTML = cellHtml;
      row.append(cell);
    });
    block.append(row);
  });
  document.body.append(block);
  return block;
}

/**
 * Creates a picture element with an img inside for testing image blocks.
 * @param {string} src - image src
 * @param {string} alt - image alt text
 * @returns {HTMLPictureElement}
 */
export function createPicture(src = '/media/test.jpg', alt = 'Test image') {
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  picture.append(img);
  return picture;
}
