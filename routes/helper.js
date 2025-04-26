exports.cleanText = (input) => {
    const [first, ...rest] = input;
    const [_, header] = first.split("\n");
    const processedRest = rest.map(item => item.replace(/\n/g, " ").trim());
    
    return [header, ...processedRest].join("").replace(/,/g, "");
  };

const getText = (textAnchor, text) => {
    if (!textAnchor?.textSegments || textAnchor?.textSegments.length === 0) {
      return "";
    }
    const startIndex = textAnchor.textSegments[0].startIndex || 0;
    const endIndex = textAnchor.textSegments[0].endIndex;
    return text.substring(startIndex, endIndex);
  };

  exports.extractText = (doc, text) => {
    // Function to extract text based on textAnchor positions
  let fontSize = [];
  let textString = [];
  let textselectionThreshold = 0;
  let selectedText = [];

  doc?.pages.forEach((page, pageIndex) => {
    //console.log(`📄 Processing Page ${pageIndex + 1}...`);

    page?.paragraphs?.forEach((paragraph) => {
      const extractedText = getText(paragraph.layout.textAnchor, text);
      if (!extractedText) return;

      // Bounding box calculation for font size
      const boundingBox = paragraph.layout.boundingPoly?.vertices;

      if (boundingBox && boundingBox.length >= 2) {
        fontSize.push(boundingBox[3].y - boundingBox[0].y);  // Height of the text block
      }
      // Append extracted text with font size info
      textString.push(extractedText);
      //console.log(`✅ Extracted: ${extractedText} | Font Size: ${fontSize}`);
    });
  });

  // find second highest font size
  const calfontSize = [...new Set(fontSize)].sort((a, b) => a - b);
  textselectionThreshold = calfontSize[calfontSize.length-2];
  //console.log(textselectionThreshold);
  selectedText = textString.filter((item, index)=> fontSize[index] >= textselectionThreshold);
  return selectedText;
  }
  