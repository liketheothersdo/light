const callButton = document.getElementById("callBtn-miami-beach");
if (callButton) {
  callButton.addEventListener("click", () => {
    const phoneNumber = "3053978484"; 
    window.open(`tel:${phoneNumber}`, "_self");
  });
}
