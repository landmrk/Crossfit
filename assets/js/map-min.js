mapboxgl.accessToken="pk.eyJ1IjoibGFuZG1yayIsImEiOiJjajV1dzZqemkxczA2MndxdHZrN3I0dGhtIn0.OQf_LxW3LV68pDjF4pTxdQ";var map=new mapboxgl.Map({container:"map",style:"mapbox://styles/landmrk/ckcd73d8e7sca1imtabjdx8hr",zoom:5,center:[-.1278,51.5074],pitch:1});function setmapFacts(e){map.addSource("places",{type:"geojson",data:e,cluster:!1}),map.loadImage("../assets/imgs/hotspot.png",((e,a)=>{if(e)throw e;map.addImage("hotspot",a)})),map.addLayer({id:"places",type:"symbol",source:"places",layout:{"icon-image":"hotspot","icon-allow-overlap":!0,"icon-size":.5,"icon-offset":[0,-77]}}),map.on("click","places",(function(e){var a=e.features[0].geometry.coordinates.slice();const{figure:t,icon:o,poi:n,location:s}=e.features[0].properties,i=`<img src="${o}" style="width:100%" /><h4 style="margin-bottom:5px; color:#000">Location</h4> <p>${s}</p> <p>${n}</p><p><strong>#20Challenges</strong></p>`;for(;Math.abs(e.lngLat.lng-a[0])>180;)a[0]+=e.lngLat.lng>a[0]?360:-360;(new mapboxgl.Popup).setLngLat(a).setHTML(i).addTo(map)})),map.on("mouseenter","places",(function(){map.getCanvas().style.cursor="pointer"})),map.on("mouseleave","places",(function(){map.getCanvas().style.cursor=""}))}map.on("load",(function(){d3.json("https://8d2afuams5.execute-api.us-east-1.amazonaws.com/dev/getMap",(function(e,a){const{route:t,reachedRoute:o,mapFacts:n,metadata:s}=a;if(e)throw e;localStorage.setItem("metadata",s);const{daysRemaining:i,justGiving:p,distanceRan:c}=s;document.getElementById("daysRemaining").innerHTML=i,document.getElementById("justGiving").innerHTML=p,document.getElementById("distanceRan").innerHTML=c;const{coordinates:r}=o.features[0].geometry,m=[r[0]];let d=o;d.features[0].geometry.coordinates=m,map.addSource("routeStatic",{type:"geojson",data:t}),map.addLayer({id:"routeStatic",type:"line",source:"routeStatic",layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#fff","line-opacity":.8,"line-width":6}}),map.addSource("trace",{type:"geojson",data:d}),map.addLayer({id:"trace",type:"line",source:"trace",layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#008ACD","line-opacity":1,"line-width":6}}),map.jumpTo({center:m[1],zoom:5}),map.setPitch(1);var l=0,u=window.setInterval((function(){l<r.length?(d.features[0].geometry.coordinates.push(r[l]),map.getSource("trace").setData(d),map.panTo(r[l]),l++):window.clearInterval(u)}),2500);map.loadImage("../assets/imgs/hotspot.png",((e,a)=>{if(e)throw e;map.addImage("info",a)})),setmapFacts(n),map.addControl(new mapboxgl.NavigationControl)}))}));