//element references
var table, tds, minesleftE, timeE;

//game settings
var width = 16;
var height = 16;
var mines = 40;
const presets = [
    {width: 9, height: 9, mines: 10},
    {width: 16, height: 16, mines: 40},
    {width: 30, height: 16, mines: 99}
]
var firstClick = true;

//game vars
var playfield;
let mineset = new Set();
//just because of a small bug where the game would break if you changed settings mid-game
//that would never occur in normal gameplay, i have to lock in the game width and height like this nykW
var game = {
    w: 0,
    h: 0,
    m: 0,
    mleft: 0,
    clicked: 0
}

//timer stuff
var timer, time = 0;

const colors = ['', 'cyan', 'lime', 'tomato', 'violet', 'yellow', 'deeppink', 'darkred', 'black'];

window.onload = function(){
    table = document.getElementById('table');
    minesleftE = document.getElementById('minesleftE');
    timeE = document.getElementById('timeE');
    document.getElementById('width').value = width;
    document.getElementById('height').value = height;
    document.getElementById('mines').value = mines;
    initHtml()
}

function setPreset(p){
    width = presets[p].width;
    height = presets[p].height;
    mines = presets[p].mines;
    document.getElementById('width').value = width;
    document.getElementById('height').value = height;
    document.getElementById('mines').value = mines;
}

function setWidth(e){width = parseInt(e.target.value)}
function setHeight(e){height = parseInt(e.target.value)}
function setMines(e){mines = parseInt(e.target.value)}
function toggleFirstClick(){firstClick = !firstClick}

function newGame(){
    initHtml();

    game = {
        w: width,
        h: height,
        m: mines,
        mleft: mines,
        clicked: 0
    }

    minesleftE.innerText = game.mleft;

    mineset.clear();

    while(mineset.size < mines){
        mineset.add(Math.floor(Math.random()*width*height))
    }

    playfield = [];
    let cx, cy;
    let n = 0;
    for (let x = 0; x < height; x++) {
        playfield[x] = [];
        for (let y = 0; y < width; y++) {
            playfield[x][y] = {clicked: false, marked: false}
            playfield[x][y].mines = calcMineCount(n++);
            if(playfield[x][y].mines === 0 && firstClick && !cx && x > height/5){
                cx = x;
                cy = y;
            }
        }
    }

    if(firstClick && cx)clickHandler(cx, cy);
    
    time = 0;
    clearInterval(timer)
    timer = setInterval(timerHandler, 1000)
}

function calcMineCount(n){
    if(mineset.has(n)) return null;
    
    let r = 0;

    //yes very flashy for that saves like 3 lines instead of hardcoding all 8 tiles LULW
    for (let i = -1; i < 2; i++) {
        if(n%width !== 0){
            if(mineset.has(n+width*i-1)) r++
        }
        if(n%width !== width-1){
            if(mineset.has(n+width*i+1)) r++
        }
    }
    if(mineset.has(n-width)) r++
    if(mineset.has(n+width)) r++

    return r;
}

function timerHandler(){
    timeE.innerText = ++time;
}

function clickHandler(x, y){
    const tile = playfield[x][y];
    if(!tile || tile.clicked || tile.marked) return
    tile.clicked = true;
    game.clicked++;
    const td = tds[x*game.w+y];

    if(tile.mines === null){
        clearInterval(timer);
        td.style.backgroundColor = 'red';
        revealMines();
    }else{
        td.style.backgroundColor = '#444';
        td.style.color = colors[tile.mines];
        td.innerText = tile.mines;
        
        //if all non mine tiles clicked -> win
        if(game.clicked === game.h*game.w-game.m){
            clearInterval(timer)
            return
        }

        //if 0 mines around tile, flood fill
        if(tile.mines === 0){
            if(x > 0){
                clickHandler(x-1, y-1)
                clickHandler(x-1, y)
                clickHandler(x-1, y+1)
            }
            clickHandler(x, y-1)
            clickHandler(x, y+1)
            if(x < game.h-1){
                clickHandler(x+1, y-1)
                clickHandler(x+1, y)
                clickHandler(x+1, y+1)
            }
        }
    }
}

function rightClickHandler(x, y, e){
    e.preventDefault();

    const tile = playfield[x][y];
    if(tile.clicked) return

    const td = tds[x*game.w+y];

    if(tile.marked){
        td.style.removeProperty('background-color');
        minesleftE.innerText = ++game.mleft;
    }else{
        td.style.backgroundColor = 'green';
        minesleftE.innerText = --game.mleft;
    }
    tile.marked = !tile.marked;
}

function revealMines(){
    for (let x = 0; x < game.h; x++) {
        for (let y = 0; y < game.w; y++) {
            if(playfield[x][y].mines === null){
                if(!playfield[x][y].marked) tds[x*game.w+y].style.backgroundColor = 'red';
            }else{
                if(playfield[x][y].marked) tds[x*game.w+y].innerText = '×';
            }
        }
    }

    // this is a much simpler for, but doesn't 'X' the wrong mine marks like the usual minesweeper
    // for (const m of mineset) {
    //     const x = Math.floor(m/height);
    //     const y = m%width;

    //     if(playfield[x][y].marked) tds[m].innerText = '✓'
    //     else tds[m].style.backgroundColor = 'red'
    // }
}

function initHtml(){
    // const col = '<td></td>'
    // const row = `<tr>${col.repeat(w)}</tr>`;
    // playground.innerHTML = row.repeat(h);

    let ih = '';
    for (let x = 0; x < height; x++) {
        ih += "<tr>"
        for (let y = 0; y < width; y++) {
            ih += `<td id="${x};${y}" onclick="clickHandler(${x}, ${y})" oncontextmenu="rightClickHandler(${x}, ${y}, event)"></td>`
        }
        ih += "</tr>"
    }
    table.innerHTML = ih;
    tds = document.getElementsByTagName('td');
}