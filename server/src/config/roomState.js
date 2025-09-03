const roomState={};

function shuffle(array){
    return array.sort(()=> Math.floor(Math.random()-0.5));
}

module.exports= {roomState, shuffle};