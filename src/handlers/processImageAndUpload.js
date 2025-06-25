// const { createCanvas, loadImage } = require('canvas');
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const FormData = require('form-data');
// const fetch = require('node-fetch'); // لتحميل الصور من الإنترنت

// async function processImageAndUpload(imageUrl, imgbbApiKey) {
//   try {
//     // تحميل الصورة من الرابط
//     const response = await fetch(imageUrl);
//     const buffer = await response.buffer();

//     const image = await loadImage(buffer);
//     const canvas = createCanvas(image.width, image.height);
//     const ctx = canvas.getContext('2d');

//     // رسم الصورة الأصلية
//     ctx.drawImage(image, 0, 0);

//     // إعدادات النجمة
//     ctx.font = `${Math.floor(image.width / 8)}px Arial`;
//     ctx.fillStyle = 'gold';
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText('⭐', image.width / 2, image.height / 2);

//     // حفظ الصورة مؤقتًا
//     const tempPath = path.join(__dirname, 'temp_image.png');
//     const outBuffer = canvas.toBuffer('image/png');
//     fs.writeFileSync(tempPath, outBuffer);

//     // رفع الصورة إلى imgbb
//     const form = new FormData();
//     form.append('image', fs.readFileSync(tempPath).toString('base64'));

//     const uploadRes = await axios.post(
//       `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
//       form,
//       { headers: form.getHeaders() }
//     );

//     // حذف الملف المؤقت بعد الرفع
//     fs.unlinkSync(tempPath);

//     const imageLink = uploadRes.data.data.url;
//     return imageLink;

//   } catch (err) {
//     console.error('❌ Error in image processing or upload:', err.message);
//     return null;
//   }
// }

// module.exports = {
//     processImageAndUpload
//   };
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function processImageAndUpload(imageUrl, imgbbApiKey, overlayImageUrl, frameImageUrl) {
  try {
    // تحميل الصورة الأساسية
    const baseResponse = await fetch(imageUrl);
    const baseBuffer = await baseResponse.buffer();
    const baseImage = await loadImage(baseBuffer);

    const scale = 3; // ⬅️ دقة أعلى
    const canvas = createCanvas(baseImage.width * scale, baseImage.height * scale);
    const ctx = canvas.getContext('2d');

    // تحسين الجودة
    ctx.patternQuality = 'best';
    ctx.filter = 'high';
    ctx.quality = 'best';

    ctx.scale(scale, scale);

    // ✅ رسم الخلفية
    ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);

    // ✅ إضافة طبقة شفافة (يمكنك حذفها)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(0, 0, baseImage.width, baseImage.height);

    // 🎯 تحميل التراكب
    const overlayResponse = await fetch(overlayImageUrl);
    const overlayBuffer = await overlayResponse.buffer();
    const overlayImage = await loadImage(overlayBuffer);

    const maxOverlayWidth = baseImage.width / 2.5;
    const overlayWidth = Math.min(overlayImage.width, maxOverlayWidth);
    const overlayHeight = (overlayImage.height / overlayImage.width) * overlayWidth;

    const x = (baseImage.width - overlayWidth) / 2;
    const y = (baseImage.height - overlayHeight) / 2;

    ctx.drawImage(overlayImage, x, y, overlayWidth, overlayHeight);

    // 🖼️ تحميل وإضافة الإطار
    if (frameImageUrl) {
      const frameResponse = await fetch(frameImageUrl);
      const frameBuffer = await frameResponse.buffer();
      const frameImage = await loadImage(frameBuffer);

      const framePadding = overlayWidth * 0.5;
      const frameX = x - framePadding;
      const frameY = y - framePadding;
      const frameW = overlayWidth + framePadding * 2;
      const frameH = overlayHeight + framePadding * 2;

      ctx.drawImage(frameImage, frameX, frameY, frameW, frameH);
    }

    // ✅ حفظ الصورة مؤقتًا
    const tempPath = path.join(__dirname, 'temp_image.png');
    const outBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(tempPath, outBuffer);

    // ✅ رفع إلى imgbb
    const form = new FormData();
    form.append('image', fs.readFileSync(tempPath).toString('base64'));

    const uploadRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      form,
      { headers: form.getHeaders() }
    );

    fs.unlinkSync(tempPath);

    const imageLink = uploadRes.data.data.url;
    console.log('✅ Uploaded Image:', imageLink);
    return imageLink;

  } catch (err) {
    console.error('❌ Error in image processing or upload:', err.message);
    return null;
  }
}

module.exports = {
  processImageAndUpload
};
