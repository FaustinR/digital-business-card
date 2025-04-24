const inputs = ['first-name', 'last-name','role', 'phone', 'email', 'address', 'country'];
const firstName = document.getElementById('first-name').value.trim();
const lastName = document.getElementById('last-name').value.trim();
const linkedin = document.getElementById("linkedIn").href;
const website = document.getElementById("website").href;
const email = document.getElementById('email').value.trim();
const summaryInfos = document.getElementById('summary-infos');
const country = 'France'
const companyName = "Worldgrid";

const addresses = [
  {
    name : "Aix",
    street : "665 avenue Galiléee",
    PostalCode: "\nBP 20140",
    city: "\n13799 Aix-en-Provence Cedex 03"
  },
  {
    name : "Bezons",
    street : "80 quai Voltaire",
    PostalCode: "\nRiver Ouest - Campus ATOS",
    city: "\n95877 Bezons Cedex"
  },
  {
    name : "Echirolles",
    street : "3 rue de Provence",
    PostalCode: "\n38130",
    city: "Echirolles"
  }
]

const summaryMap = {
  role: 'display-role',
  phone: 'display-phone',
  email: 'display-email',
  address: 'display-adress',
  country: 'display-country'
};

let qrCode;
function generateQRCode(text) {
    // Create QR code
    const qrCode = document.getElementById('qrcode');
    var qr = qrcode(0, 'L'); // 4 = QR code version, 'L' = low error correction
    qr.addData(text);
    qr.make();

    qrCode.innerHTML = qr.createSvgTag({
      scalable: true
    });
    qrCode.setAttribute('title', text);
}

function getFormData() {
  const data = {};
  inputs.forEach(id => {
    data[id] = document.getElementById(id).value.trim();
  });
  
  const address = getAddress();
  data.street = address.street;
  data.code = address.code;
  data.city = address.city

  data.country = country;
  data.company = companyName;
  return data;
}

var vcardData = "";

function updateSummaryAndQRCode() {
  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  
  const data = getFormData();

  const address = getAddress();

  data.street = address.street;
  data.code = address.code;
  data.city = address.city

  const addressToDisplay = [
    data.street,
    data.code,
    data.city
  ].join('\n');

  inputs.forEach(id => {
    if(['first-name', 'last-name'].includes(id)){
      document.getElementById('display-names').textContent = firstName || lastName ? `${firstName} ${lastName}` : ''
    }else if(id === 'address'){
      document.getElementById('display-adress').innerHTML = addressToDisplay;
    }else{
      document.getElementById(summaryMap[id]).textContent = data[id];
    }
  });

  // addLineBreaks('display-role', 32);
  customizeDisplayRole('display-role');

  
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:${data['last-name']};${data['first-name']}
FN:${data['first-name']} ${data['last-name']}
ORG:${data.company}
TEL;TYPE=CELL:${data.phone}
TITLE:${data.role}
EMAIL:${data.email}
URL;TYPE=WORK:${website}
URL;TYPE=home:${linkedin}
ADR;TYPE=work:;;${data.street.replace('<br>','')};${data.city.replace('<br>','')};;${data.code.replace('<br>','')};${data.country.replace('<br>','')}
END:VCARD`;

  
  emptyField = checkEmptyFields();
  const notifClass = emptyField !== '' ? 'error' : 'success'
  let message = ""
  if(emptyField !== ''){
    let message = `${emptyField} must be provided`;
    notify(emptyField, notifClass, message);
  }else{
    generateQRCode(vcard);
    vcardData = vcard;  
  }
}

inputs.forEach(id => {
  document.getElementById(id).addEventListener('input', updateSummaryAndQRCode);
});

document.getElementById("download-qr-code").addEventListener("click", async () => {

  await document.fonts.ready;
  const data = getFormData();

  html2canvas(document.getElementById("summary-infos"), {
    useCORS: true,
    scale: 2
  }).then(canvas => {
    canvas.toBlob(blob => {
      const zip = new JSZip();
      zip.file("qr-code.png", blob);
      zip.file("contact.vcf", vcardData);
      zip.generateAsync({ type: "blob" }).then(content => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = `${data['first-name']}_${data['last-name']}_business_card`;
        a.click();
      });
    });
  });
});

function addLineBreaks(id, limit) {
  const element = document.getElementById(id);
  if (!element) return;

  const originalText = element.textContent;
  let result = '';

  for (let i = 0; i < originalText.length; i += limit) {
    result += originalText.slice(i, i + limit) + '<br>';
  }
  element.innerHTML = result;
}

function getAddress(){
  const addressName = document.getElementById('address').value.trim();
  const address = addresses.find(add => add.name === addressName)
  const addressJson = {}

  addressJson.street = address.street.replace(/\n/g, '<br>');
  if(addressName !== 'Echirolles'){
    addressJson.code = address.PostalCode.replace(/\n/g, '<br>');
    addressJson.city = address.city.replace(/\n/g, '<br>')
  }else{
    addressJson.code = address.PostalCode.replace(/\n/g, '<br>');
    addressJson.city = address.city;
  }
  return addressJson
}

function displayQrCode(){
  const data = getFormData();
  emptyField = checkEmptyFields();
  const notifClass = emptyField !== '' ? 'error' : 'success';
  let message;
  if(emptyField !== ''){
    message = `${emptyField} must be provided`;
    notify(emptyField, notifClass, message);
  }else{
    let name = document.getElementById('first-name').value.trim()
    message = `Dear ${name}, your business card has been created`
    notify(emptyField, 'success', message);
    document.getElementById('qrcode').style.display = "block";
    document.getElementById('download-qr-code').style.display = "block";
    document.getElementById('globe').style.marginTop = "-6vh"
    const personalInfos = document.querySelector('.personal-infos');
    personalInfos.style.marginTop = "3vh";
  }
}

window.onload = ()=>{
  updateSummaryAndQRCode();
}

function customizeDisplayRole(id) {
  const role = document.getElementById(id);
  if (role) {
    const content = role.textContent;

    // Add a line break after the first 20 characters
    const newContent = content.length > 20
      ? content.slice(0, 19) + '<br>' + content.slice(19)
      : content;
      role.innerHTML = newContent;
  }
}

function checkEmptyFields(){
  let field = "";
  const data = getFormData();
  if(data['first-name'] === ''){
    field = "First name";
  }else if(data['last-name'] === ''){
    field = "Last name";
  }else if(data.email === ''){
    field = "Email address";
  }else if(data['first-name'] === '' && data['last-name'] === ''){
    field = "Email address";
    console.log(data);
  }
  return field;
}

function notify(emptyField, fieldClass, message){
  let notification = document.getElementById('notification');
  if(emptyField !== ''){
    notification.textContent = message;
    notification.className = ` notification ${fieldClass}`;
    document.getElementById('qrcode').style.display = "none";
    document.getElementById('download-qr-code').style.display = "none";
  }else{
    notification.textContent = message;
    notification.className = ` notification ${fieldClass}`;
  }

  notification.style.display = "block";
  setTimeout(function() {
    notification.style.display = "none";
  }, 5000)
}