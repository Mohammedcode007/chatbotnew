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

    // إنشاء Canvas رئيسي
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');

    // ✅ إنشاء طبقة مؤقتة لخلفية باهتة فقط
    const backgroundCanvas = createCanvas(baseImage.width, baseImage.height);
    const backgroundCtx = backgroundCanvas.getContext('2d');

    backgroundCtx.globalAlpha = 0.5; // شفافية الخلفية فقط
    backgroundCtx.drawImage(baseImage, 0, 0);

    // رسم الخلفية الباهتة في الـ canvas الرئيسي
    ctx.drawImage(backgroundCanvas, 0, 0);

    // تحميل صورة التراكب
    const overlayResponse = await fetch(overlayImageUrl);
    const overlayBuffer = await overlayResponse.buffer();
    const overlayImage = await loadImage(overlayBuffer);

    // أبعاد التراكب
    const overlayWidth = baseImage.width / 3;
    const overlayHeight = (overlayImage.height / overlayImage.width) * overlayWidth;
    const x = (baseImage.width - overlayWidth) / 2;
    const y = (baseImage.height - overlayHeight) / 2;

    // ✅ رسم التراكب في المنتصف بدون شفافية
    ctx.drawImage(overlayImage, x, y, overlayWidth, overlayHeight);

    // تحميل الإطار
    if (frameImageUrl) {
      const frameResponse = await fetch(frameImageUrl);
      const frameBuffer = await frameResponse.buffer();
      const frameImage = await loadImage(frameBuffer);

      const framePadding = overlayWidth * 0.1;
      const frameX = x - framePadding;
      const frameY = y - framePadding;
      const frameW = overlayWidth + framePadding * 2;
      const frameH = overlayHeight + framePadding * 2;

      ctx.drawImage(frameImage, frameX, frameY, frameW, frameH);
    }

    // حفظ الصورة مؤقتًا
    const tempPath = path.join(__dirname, 'temp_image.png');
    const outBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(tempPath, outBuffer);

    // رفع إلى imgbb
    const form = new FormData();
    form.append('image', fs.readFileSync(tempPath).toString('base64'));

    const uploadRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      form,
      { headers: form.getHeaders() }
    );

    fs.unlinkSync(tempPath);
    return uploadRes.data.data.url;

  } catch (err) {
    console.error('❌ Error in image processing or upload:', err.message);
    return null;
  }
}

module.exports = {
  processImageAndUpload
};


