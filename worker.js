// Based on https://developers.cloudflare.com/workers/examples/geolocation-hello-world
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  let html_content = ""
  let html_style = "body{padding:6em; font-family: sans-serif;} h1{color:#f6821f}"

  html_content += "<p> IP: " + request.headers.get("CF-Connecting-IP") + "</p>"
  html_content += "<p>IPV6: <span id='ipv6-info'></span></p>"
  html_content += "<p>主机: <span id='hostname'></span></p>"
  html_content += "<p> ASN: " + request.cf.asn +" "+request.cf.asOrganization+ "</p>"
  html_content += "<p> 国家/地区: " + request.cf.country + "</p>"
  html_content += "<p>位置: <span id='city'></span></p>"
  html_content += "<p> 时区: " + request.cf.timezone + "</p>"
  html_content += "<p> 纬度: " + request.cf.latitude + "</p>";
  html_content += "<p> 经度: " + request.cf.longitude + "</p>";
  html_content += "<p> CF节点: " + request.cf.colo + "</p>";
  html_content += "<p> 浏览器UA: " + request.headers.get("user-agent") + "</p>";

  let html = `
<!DOCTYPE html>
<body>
  <head>
    <title>IP查询-SHSSEDU</title>
    <style> ${html_style} </style>
    <script src="https://cdn.staticfile.org/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdn.staticfile.org/FileSaver.js/2.0.5/FileSaver.min.js"></script>
  </head>
  <h1>IP查询-<a href="https://shssedu.ac.cn">SHSSEDU</a></h1>
  <p>欢迎你的使用，IP信息仅供参考 </p>

  ${html_content}
  <script>
      function getHostInfo() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://ipip.ee/host/', true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            const responseText = xhr.responseText;
            if (!responseText.includes('nil') && !responseText.includes('Failed to '))  {
              document.getElementById('hostname').innerHTML = '(' + responseText.trim() + ')';
            }
          }
        };
        xhr.send();
      }

      getHostInfo();
    </script>
    <script>
                const ipv6InfoElement = document.getElementById("ipv6-info");

                fetch("https://ipv6.ipip.ee/api/?format=json")
                    .then(response => response.json())
                    .then(data => {
                        const ip = data.ip ? data.ip : "获取失败";
                        const country = data.country ? data.country : "获取失败";
                        ipv6InfoElement.textContent = ip + ' (' + country + ')';
                    })
                    .catch(error => {
                        console.log(error);
                        ipv6InfoElement.textContent = "获取失败";
                    });
            </script>
  <script>
  function getIPInfo() {
    fetch('https://www.yuanxiapi.cn/api/iplocation/?ip=${request.headers.get("CF-Connecting-IP")}')
      .then(response => response.json())
      .then(data => { 
        document.getElementById('city').textContent = data.location;
      })
      .catch(error => {
        console.log('Error:', error);
      });
  }

  window.onload = getIPInfo;
</script>
<button id="screenshot-button">截图保存</button>
<script>
const screenshotButton = document.getElementById('screenshot-button');
screenshotButton.addEventListener('click', () => {

    screenshotButton.style.display = 'none';

    html2canvas(document.body).then(canvas => {
        canvas.toBlob(blob => {

            screenshotButton.style.display = '';
            saveAs(blob, 'myipinfo');
        });
    });
});
</script>
<p>IP数据来自ipinfo.io和Cloudflare,仅供学习与交流，切勿滥用本服务。</p>
</body>`

  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },})
}
