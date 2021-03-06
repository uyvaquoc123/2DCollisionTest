$(function() {
    var velocity = 1;
    var adx = velocity;
    var ady = velocity;
    var bdx = -velocity;
    var bdy = -velocity;
    var running = false,
        started = false,
        frameID = null;


    $(document).ready(function() {
        $("#minus").click(function() {
            updateVelocity(2);
        });
        $("#plus").click(function() {
            updateVelocity(1);
        });
        $("#start").click(function() {
            start();
        });
        $("#stop").click(function() {
            stop();
        });
    })

    function updateVelocity(status) {
        if (status === 1) {
            velocity += 0.1;
        }
        if (status === 2) {
            velocity -= 0.1;
        }
        adx = velocity;
        ady = velocity;
        bdx = -velocity;
        bdy = -velocity;
    }

    function panic() {
        delta = 0;
    }

    function start() {
        if (!started) {
            started = true;
            frameID = requestAnimationFrame(function(timestamp) {
                draw(timestamp);
                running = true;
                lastFrameTimeMs = timestamp;
                lastFpsUpdate = timestamp;
                framesThisSecond = 0;
                frameID = requestAnimationFrame(draw);
            });
        }
    }


    var canvas = document.getElementById('Canvas');
    if (canvas.getContext) {

        var ctx = canvas.getContext('2d');


        var a1 = new xy(100, 62);
        var a2 = new xy(69, 184);
        var a3 = new xy(196, 176);
        var a4 = new xy(229, 75);

        var b1 = new xy(641, 654);
        var b2 = new xy(578, 632);
        var b3 = new xy(659, 536);
        var b4 = new xy(734, 639);

        var A = [a1, a2, a3, a4];
        var B = [b1, b2, b3, b4];

        var lastFrameTimeMs = 0;
        var maxFPS = 999;
        var delta = 0;
        var timestep = 1000 / maxFPS;
        var fps = 60;
        var framesThisSecond = 0;
        var lastFpsUpdate = 0;


        function draw(timestamp) {
            begin();
            if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
                frameID = requestAnimationFrame(draw);
                return;
            }

            delta += timestamp - lastFrameTimeMs; // get the delta time since last frame
            lastFrameTimeMs = timestamp;

            if (timestamp > lastFpsUpdate + 1000) { //Fps counter
                fps = 0.25 * framesThisSecond + 0.75 * fps;

                lastFpsUpdate = timestamp;
                framesThisSecond = 0;
            }
            framesThisSecond++;

            var numUpdateSteps = 0;
            while (delta >= timestep) {
                update(timestep);
                delta -= timestep;
                if (++numUpdateSteps >= 240) {
                    panic();
                    break;
                }
            }


            var verticesA = [A[0], A[1], A[2], A[3]];
            var edgesA = [Vecto(A[0], A[1]), Vecto(A[1], A[2]), Vecto(A[2], A[3]), Vecto(A[3], A[0])];

            var verticesB = [B[0], B[1], B[2], B[3]];
            var edgesB = [Vecto(B[0], B[1]), Vecto(B[1], B[2]), Vecto(B[2], B[3]), Vecto(B[3], B[0])];


            var polygonA = new polygon(verticesA, edgesA);
            var polygonB = new polygon(verticesB, edgesB);



            if (sat(polygonA, polygonB)) {
                adx = -adx;
                ady = -ady;
                bdx = -bdx;
                bdy = -bdy;
                document.body.style.backgroundColor = "red";
            } else {
                document.body.style.backgroundColor = "rgb(247, 231, 238)";
            }
            // sat(polygonA, polygonB);
            ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the before canvas
            drawPoly1();
            drawPoly2();
            drawSpeed();
            drawFps();
            end(fps);


            frameID = requestAnimationFrame(draw);
        }
    }

    function stop() {
        if (frameID) {
            running = false;
            started = false;
            cancelAnimationFrame(frameID);
        }
    }

    function begin() {}

    function end(fps) {
        if (fps < 144) {
            document.body.style.backgroundColor = "rgb(247, 231, 238)";
        } else if (fps > 144) {
            document.body.style.backgroundColor = "#a6ffb3";
        }
    }


    function drawSpeed() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "green";
        ctx.fillText("Speed: " + Math.round((velocity + Number.EPSILON) * 100) / 100, 8, 20);
    }

    function drawFps() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "green";
        ctx.fillText(Math.round(fps) + " FPS", canvas.width - 70, 20);
    }

    function update(para) {
        for (let index = 0; index < A.length; index++) {
            A[index].x += adx * para;
            A[index].y += ady * para;
        }
        for (let index = 0; index < B.length; index++) {
            B[index].x += 0.5 * bdx * para;
            B[index].y += bdy * para;
        }
        checkCol();
    }

    function checkCol() {
        for (let i = 0; i < A.length; i++) {
            if (A[i].x < 0 || A[i].x > canvas.width) {
                adx = -adx;
            } else if (A[i].y < 0 || A[i].y > canvas.height) {
                ady = -ady;
            }

        }
        for (let i = 0; i < B.length; i++) {
            if (B[i].x < 0 || B[i].x > canvas.width) {
                bdx = -bdx;
            }
            if (B[i].y < 0 || B[i].y > canvas.height) {
                bdy = -bdy;
            }
        }

    }

    function drawPoly1() {
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.moveTo(a1.x, a1.y);
        ctx.lineTo(a2.x, a2.y);
        ctx.lineTo(a3.x, a3.y);
        ctx.lineTo(a4.x, a4.y);
        ctx.closePath();
        ctx.fill();
    }

    function drawPoly2() {
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(b3.x, b3.y);
        ctx.lineTo(b4.x, b4.y);
        ctx.closePath();
        ctx.fill();
    }

    function Vecto(C, D) {
        return new xy((D.x - C.x), (D.y - C.y));
    }

    function xy(x, y) {
        this.x = x;
        this.y = y;
    };

    function polygon(vertices, edges) {
        this.vertex = vertices;
        this.edge = edges;
    };
    //include appropriate test case code.
    var amin = null;
    var amax = null;
    var bmin = null;
    var bmax = null;
    var invade = null;

    function sat(polygonA, polygonB) {
        var perpendicularLine = null;
        var dot = 0;
        var perpendicularStack = [];
        amin = null;
        amax = null;
        bmin = null;
        bmax = null;
        for (var i = 0; i < polygonA.edge.length; i++) {
            perpendicularLine = new xy(-polygonA.edge[i].y, polygonA.edge[i].x);
            perpendicularStack.push(perpendicularLine);
        }
        for (var i = 0; i < polygonB.edge.length; i++) {
            perpendicularLine = new xy(-polygonB.edge[i].y, polygonB.edge[i].x);
            perpendicularStack.push(perpendicularLine);
        }
        for (var i = 0; i < perpendicularStack.length; i++) {
            amin = null;
            amax = null;
            bmin = null;
            bmax = null;
            for (var j = 0; j < polygonA.vertex.length; j++) {
                dot = (polygonA.vertex[j].x *
                        perpendicularStack[i].x) +
                    (polygonA.vertex[j].y *
                        perpendicularStack[i].y);
                if (amax === null || dot > amax) {
                    amax = dot;
                }
                if (amin === null || dot < amin) {
                    amin = dot;
                }
            }
            for (var j = 0; j < polygonB.vertex.length; j++) {
                dot = polygonB.vertex[j].x *
                    perpendicularStack[i].x +
                    polygonB.vertex[j].y *
                    perpendicularStack[i].y;
                if (bmax === null || dot > bmax) {
                    bmax = dot;
                }
                if (bmin === null || dot < bmin) {
                    bmin = dot;
                }
            }


            if ((amin < bmax && amin > bmin) ||
                (bmin < amax && bmin > amin)) {
                if (amax >= bmax) {
                    invade = Math.abs(amax - bmin) - Math.abs(amax - bmax) - Math.abs(amin - bmin);
                } else { invade = Math.abs(bmax - amin) - Math.abs(bmax - amax) - Math.abs(bmin - amin); }
                continue;
            } else {
                return false;
            }

        }


        return true;
    }
});