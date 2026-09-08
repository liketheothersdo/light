const callBtn = document.getElementById('callBtn-middy');
if (callBtn) {
  callBtn.addEventListener('click', function() {
    const phoneNumber = "2126844914"; 
    window.open(`tel:${phoneNumber}`, "_self");
  });
}
