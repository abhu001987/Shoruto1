const params = new URLSearchParams(window.location.search)
const category = params.get("cat")

let currentPage = 1
let loading = false
const loadCount = 10

function goBack(){
  window.location.href="/"
}

/* 🚀 PAGINATED FETCH */

const baseURL = "https://orange-violet-4cc8.treedell1996.workers.dev"

function loadMore(){

  if (loading) return
  loading = true

  const container = document.getElementById("posts")

  const url = `${baseURL}/${category || "daily"}?page=${currentPage}`

  // ✅ VERSION + CACHE FIX (ONLY ADDITION)
  const finalURL = url + "&v=" + (localStorage.getItem("version") || "1")

  fetch(finalURL, { cache: "no-store" })
  .then(res => {

    // ✅ VERSION CHECK (ONLY ADDITION)
    const newVersion = res.headers.get("X-Version")

    if (newVersion && newVersion !== localStorage.getItem("version")) {
      localStorage.setItem("version", newVersion)
      location.reload()
    }

    return res.json()
  })
  .then(data => {

    if (!data || data.length === 0) {
      loading = true
      return
    }

    data.forEach(post => {

      /* HERO IMAGE POST */

      if(post.heroImage){

        const hero = document.createElement("div")
        hero.className = "hero-post"

        hero.innerHTML = `
        <img src="${post.heroImage}" class="hero-img">

        <div class="hero-overlay">
          <a href="${post.ctaLink}" class="hero-btn">${post.ctaText}</a>
        </div>

        ${post.music ? `<audio class="hero-music" src="${post.music}" loop></audio>` : ""}
        `

        container.appendChild(hero)
        return
      }

      /* NORMAL POST */

      const card = document.createElement("div")
      card.className = "post"

      card.innerHTML = `
      <div class="image-frame">

        <img src="${post.image}">

        <div class="back-btn" onclick="goBack()">←</div>

        ${post.hindi ? `<div class="hindi-btn" onclick='openHindi(${JSON.stringify(post.hindi)}, ${JSON.stringify(post.title)})'>In Hindi</div>` : ""}

      </div>

      <div class="post-meta">
        <span class="category-badge">${post.category}</span>
        <span class="post-date">${post.time}</span>
      </div>

      <div class="content">
        <h2>${post.title}</h2>
        <p>${post.content}</p>
      </div>
      `

      container.appendChild(card)
    })

    currentPage++
    loading = false
  })
  .catch(() => {
    document.getElementById("posts").innerHTML =
    "<h2 style='padding:40px;text-align:center'>No posts found</h2>"
  })
}

/* 🔥 FIRST LOAD */
loadMore()

/* SCROLL LOAD */

document.getElementById("posts").addEventListener("scroll",function(){

  const container = this

  if(container.scrollTop + container.clientHeight >= container.scrollHeight - 5){
    loadMore()
  }

})

/* HERO AUDIO */

const heroObserver = new IntersectionObserver(entries => {

  entries.forEach(entry => {

    const audio = entry.target.querySelector(".hero-music")

    if(!audio) return

    if(entry.isIntersecting){
      audio.play().catch(()=>{})
    }else{
      audio.pause()
      audio.currentTime = 0
    }

  })

},{threshold:0.6})

function observeHeroPosts(){
  document.querySelectorAll(".hero-post").forEach(post=>{
    heroObserver.observe(post)
  })
}

function openHindi(hindi, title){

  document.getElementById("hindiPopup").innerHTML = `
  <div class="popup-box">
    <h3>${title}</h3>
    <p>${hindi}</p>

    <div class="popup-actions">
      <button onclick="closeHindi()">Cancel</button>
    </div>

  </div>
  `

  document.getElementById("hindiPopup").style.display = "flex"
}

function closeHindi(){
  document.getElementById("hindiPopup").style.display = "none"
}
