```javascript id="r8m5kv"
/* FLOATING BACKGROUND */

const background = document.querySelector(".background");

for(let i=0;i<30;i++){

    const circle = document.createElement("div");

    circle.classList.add("circle");

    const size = Math.random()*100+20;

    circle.style.width = size + "px";
    circle.style.height = size + "px";

    circle.style.left =
    Math.random()*window.innerWidth + "px";

    circle.style.animationDuration =
    (Math.random()*10+10)+"s";

    circle.style.opacity = Math.random();

    background.appendChild(circle);
}

/* CURSOR GLOW */

const glow = document.querySelector(".glow");

document.addEventListener("mousemove",(e)=>{

    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";

});

/* TYPING EFFECT */

const typing = document.querySelector(".typing");

const words = [
    "Game Developer",
    "Unreal Engine Creator",
    "Interactive Designer",
    "Gameplay Systems Developer"
];

let wordIndex = 0;
let charIndex = 0;
let currentWord = "";
let isDeleting = false;

function type(){

    currentWord = words[wordIndex];

    if(isDeleting){

        typing.textContent =
        currentWord.substring(0,charIndex--);

    }else{

        typing.textContent =
        currentWord.substring(0,charIndex++);

    }

    if(!isDeleting && charIndex === currentWord.length){

        isDeleting = true;

        setTimeout(type,1000);

        return;

    }

    if(isDeleting && charIndex === 0){

        isDeleting = false;

        wordIndex =
        (wordIndex + 1) % words.length;

    }

    setTimeout(type,isDeleting ? 60 : 120);
}

type();

/* SKILL BARS */

const progressBars =
document.querySelectorAll(".progress");

setTimeout(()=>{

    progressBars.forEach(bar=>{

        bar.style.width =
        bar.getAttribute("data-width");

    });

},500);

/* REVEAL ON SCROLL */

const hiddenElements =
document.querySelectorAll(".hidden");

const observer =
new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

});

hiddenElements.forEach(el=>observer.observe(el));

/* COUNTERS */

const counters =
document.querySelectorAll(".counter");

counters.forEach(counter=>{

    const updateCounter = ()=>{

        const target =
        +counter.getAttribute("data-target");

        const count =
        +counter.innerText;

        const increment = target/100;

        if(count < target){

            counter.innerText =
            Math.ceil(count + increment);

            setTimeout(updateCounter,20);

        }else{

            counter.innerText = target;

        }

    };

    updateCounter();

});
```
