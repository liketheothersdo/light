const callButton = document.getElementById("callBtn-flat");
if (callButton) {
  callButton.addEventListener("click", () => {
    const phoneNumber = "2126200033"; 
    window.open(`tel:${phoneNumber}`, "_self");
  });
}
