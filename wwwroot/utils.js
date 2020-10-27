
var wellBufferX;
var wellBufferY;
var barBufferX;
var barBufferY;
var logDisabled = 1;



var percentileBins = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

function getIncluciveIndexEndForPercentile(percentile, len) {
    return Math.floor(percentileBins[percentile] * (len - 1) / 100.0);
}

function getBarMaxHeight(buffer) {
    return buffer.height - buffer.textSize() * 3;
}

//bins is an array of percentiles (part * 100)
function drawBarChartsToBufferWithShift(aUserEvaluation, buffer, min, max, shiftFirst, drawSubLines = false, drawLabels = false, highlightIndex) {
    var binsLen = percentileBins.length;
    var shift = buffer.width / binsLen / 5;
    var start = 0;
    var end = 0;
    var scores = aUserEvaluation.realizationScores;
    var sortedInds = aUserEvaluation.sortedIndexes;
    var barMaxHeight = getBarMaxHeight(buffer);
    //TODO do negative
    for (var i = 0; i < binsLen; i++) {

        //we subtract 1 so that for P10 for 100 it is based n index 9
        end = getIncluciveIndexEndForPercentile(i, scores.length);
        //console.log("start: " + start);
        //console.log("end: " + end);
        if (!drawSubLines) {


            var scoreInd = sortedInds[end];
            var score = Math.max(scores[scoreInd], 0.0);
            var totalWidth = 1.0 / binsLen * buffer.width - shift * 2;
            var currentYtop = (max - score) / max * barMaxHeight;
            var currentHeigth = barMaxHeight - currentYtop;
            //console.log("score: " + score);
            var xLeft = i / binsLen * buffer.width + shift + shiftFirst;

            if (highlightIndex != undefined) {
                if (drawLabels && highlightIndex == i) {
                    if (logDisabled === undefined) {
                        console.log("draw background bar: " + i);
                    }
                    buffer.rect(
                        xLeft - shift, 0, 1.0 / binsLen * buffer.width, barMaxHeight
                    );
                    //buffer.clear();
                    break;
                    //buffer.fill(20, 50, 255);
                }

            } else {
                buffer.rect(
                    xLeft,
                    currentYtop,
                    totalWidth,
                    currentHeigth);

                if (drawLabels) {
                    var textHeight = buffer.height - barMaxHeight;
                    var score = scores[scoreInd];
                    var pInd = Math.round(percentileBins[i]);
                    var scoretext = "P" + pInd + "\n" + Math.round(score);
                    if (pInd >= 100) {
                        scoretext = "max\n" + Math.round(score);
                    }
                    //remove negative for visualization
                    score = Math.max(scores[scoreInd], 0.0);


                    buffer.textAlign(CENTER, TOP);
                    buffer.strokeWeight(0);
                    buffer.text(
                        scoretext,
                        xLeft,
                        barMaxHeight + 4,
                        totalWidth,
                        textHeight * 2);

                    buffer.strokeWeight(1);
                }
            }

        }
        else {
            var singleWidth = (1.0 / binsLen * buffer.width - shift * 2) / (end + 1 - start);
            var totalWidth = (1.0 / binsLen * buffer.width - shift * 2);
            for (var k = start; k <= end; ++k) {
                var scoreInd = sortedInds[k];
                var score = Math.max(scores[scoreInd], 0.0);
                var currentYtop = (max - score) / max * barMaxHeight;
                var currentHeigth = barMaxHeight - currentYtop;
                buffer.rect(
                    i / binsLen * buffer.width + shift + shiftFirst + (k - start) * singleWidth,
                    currentYtop,
                    singleWidth,
                    currentHeigth
                );


            }
        }
        start = end + 1;
    }
    //console.log("done");

}




function redrawEnabledForAninterval() {
    drawWellToBuffer();
    //loop();
    //timerCountdown = 30;
}




var barTouched = -1;

function cmousePressed() {
    var oldBar = barTouched;
    if (mouseY > barBufferY
        && mouseY < barBufferY + barHeigth) {

        if (logDisabled === undefined) {
            console.log("mouse press");
        }
        barTouched = Math.floor(mouseX / canvasWidth * 10);
        if (logDisabled === undefined) {
            console.log("touched: " + barTouched);
        }
        if (oldBar != barTouched) {
            buttonSelectSubSet(barTouched);
        }

    }
    drawBarCharts();
    drawWellToBuffer();
    return false;
}

function cmouseReleased() {
    if (logDisabled === undefined) {
        console.log("mouse release");
    }
    return ctouchEnded();
}

function ctouchStarted() {
    return cmousePressed();
}

function cmouseMoved() {
    if (mouseIsPressed) {
        ctouchMoved();
    }
    return false;
}

function ctouchMoved() {
    return cmousePressed();
}

function ctouchEnded() {
    barTouched = -1;
    if (logDisabled === undefined) {
        console.log("touch end");
    }

    buttonSelectSubSet(barTouched);
    drawBarCharts();
    drawWellToBuffer();
    return false;
}





