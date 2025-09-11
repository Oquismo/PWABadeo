// (async()=>{
//   const fetch = global.fetch || (await import('undici')).fetch;
//   try{
//     console.log('GET /api/tasks');
//     const get = await fetch('http://localhost:3001/api/tasks');
//     console.log('GET status', get.status);
//     console.log(await get.text());

//     console.log('POST /api/tasks');
//     const post = await fetch('http://localhost:3001/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'script task',description:'from node script',color:'linear-gradient(135deg,#fff,#eee)',progress:5})});
//     console.log('POST status', post.status);
//     console.log(await post.text());
//   }catch(e){
//     console.error('ERR',e);
//   }
// })();
