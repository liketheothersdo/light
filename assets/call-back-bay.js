const callButton = document.getElementById("callBtn-back-bay");
if (callButton) {
  callButton.addEventListener("click", () => {
    const phoneNumber = "16172361444"; 
    window.open(`tel:${phoneNumber}`, "_self");
  });
}
