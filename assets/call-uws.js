const callButton = document.getElementById("callBtn-uws");
if (callButton) {
  callButton.addEventListener("click", () => {
    const phoneNumber = "2127078730"; 
    window.open(`tel:${phoneNumber}`, "_self");
  });
}
