const validateImg = (req, res, image) => {
  if (!image) return console.log({ msg: "Product image is required." });
  const maxSize = 1024 * 1024;
  if (image.size > maxSize)
    return console.log({
      msg: "File size too big. it shouldn't be greater than 1mb."
    });
  const { mimetype } = image;
  if (
    mimetype !== "image/jpg" &&
    mimetype !== "image/png" &&
    mimetype !== "image/jpeg"
  )
    return console.log({
      msg: "Unsupported file type, upload only image files."
    });
};

module.exports = validateImg;
