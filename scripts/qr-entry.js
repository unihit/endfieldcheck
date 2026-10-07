import QRCode from 'qrcode';
export const drawQR=(canvas,text)=>QRCode.toCanvas(canvas,text,{width:360,margin:4,errorCorrectionLevel:'M',color:{dark:'#11171e',light:'#ffffff'}});
