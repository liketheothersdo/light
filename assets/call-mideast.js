const callButton = document.getElementById("callBtn-mideast");
if (callButton) {
  callButton.addEventListener("click", () => {
    const phoneNumber = "12128831125"; 
    window.open(`tel:${phoneNumber}`, "_self");
  });
}