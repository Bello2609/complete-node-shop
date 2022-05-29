// const deleteProduct = (btn)=>{
//     const prodId = btn.parentNode.querySelector("[name=productId]").value;
//     console.log(prodId);
//     const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

//     const productElement = btn.closest("article");
//     fetch("/admin/product/" + prodId, {
//         method: "DELETE",
//         headers: {
//             "csrf-token": csrf
//         }
//     })
//     .then(res=>{
//         return res.json();
//     })
//     .then(data=>{
//         console.log(data);
//         productElement.parentNode.removeChild(productElement);
//     })
//     .catch(err=>{
//         console.log(err);
//     });
// }
const deleteProduct = btn => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  
    const productElement = btn.closest('article');
  
    fetch('/admin/product/' + prodId, {
      method: 'DELETE',
      headers: {
        "Content-type": "application/json",
        'csrf-token': csrf
      }
    })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  };