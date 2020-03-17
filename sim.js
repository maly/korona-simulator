window.$ = window.jQuery = require("./node_modules/jquery/dist/jquery.min.js");
require("./node_modules/bootstrap/dist/js/bootstrap.min");

var context;
var gctx;
var stop = false;
var dots = [];
var maxX = 500;
var maxY = 400;
const speed = 2;

var radius = 5;

//gfx independent

var scale = function(val) {
  return (0xcc - Math.floor(val) * 17).toString(16);
};

var drawOne = function(context, dot) {
  var col = "#aaaaaa";
  if (dot.infected) {
    col = "#" + scale(dot.infected) + "ff" + scale(dot.infected);
  }
  if (dot.sick) {
    col = "#ff" + scale(10 - dot.sick) + scale(10 - dot.sick);
  }
  if (dot.cured) {
    col = "#8888ff";
  }
  if (dot.dead) {
    col = "#000000";
    //return;
  }
  context.beginPath();
  context.fillStyle = col;
  context.arc(dot.x, dot.y, radius, 0, Math.PI * 2, true);
  context.closePath();
  context.fill();

  //mouth
  if (dot.mouth < 1) {
    context.beginPath();
    context.strokeStyle = "#ffffff";
    context.fillStyle = "#ffffff";
    context.arc(dot.x, dot.y, radius - 2, Math.PI, Math.PI * 2, true);
    context.closePath();
    context.stroke();
    context.fill();
  }

  if (dot.quarantine) {
    context.beginPath();
    context.strokeStyle = "#ffff00";
    context.arc(dot.x, dot.y, radius + 2, 0, Math.PI * 2, true);
    context.closePath();
    context.stroke();
  }
};

var dist = function(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  var dist = Math.sqrt(a * a + b * b);
  return dist < radius * 2;
};

var defaults = {
  dotcount: 400,

  bouncing: false,

  bigstep: 0,
  bigtime: 0,
  smalltime: 0,
  bigtimeScale: 5,
  bigstepCount: 15,

  quarantineUpPct: 0.1,
  quarantineDownPct: 0.05,
  quarantinePower: 6,

  mortality: 0.04,
  reinfection: 0.02,
  transfer: 0.4,

  mouthOut: 0.1,
  mouthIn: 0.01,

  quar: false,

  moveWhenSick: false
};

var g = {
  dotcount: 400,

  bouncing: false,

  bigstep: 0,
  bigtime: 0,
  smalltime: 0,
  bigtimeScale: 5,
  bigstepCount: 15,

  quarantineUpPct: 0.1,
  quarantineDownPct: 0.05,
  quarantinePower: 6,

  quar: false,

  mortality: 0.04,
  reinfection: 0.02,
  transfer: 0.4,

  mouthOut: 0.1,
  mouthIn: 0.01,

  moveWhenSick: false,

  start() {
    stop = false;
    $("#ctrl input").prop("disabled", true);
    $("#ctrl").addClass("bg-secondary");
  },
  stop() {
    stop = true;
    $("#ctrl input").prop("disabled", false);
    $("#ctrl").removeClass("bg-secondary");
  },

  genDot() {
    //try to find a position
    var x, y;
    var mx = maxX - 2 * radius;
    var my = maxY - 2 * radius;
    while (true) {
      x = Math.floor(Math.random() * mx) + radius;
      y = Math.floor(Math.random() * my) + radius;
      if (dots.length === 0) break;
      var test = dots
        .map(q => dist(q.x, q.y, x, y))
        .reduce((p, c) => (c ? true : p), false);
      if (!test) break;
    }
    return {
      x: x,
      y: y,
      sane: 1,
      infected: 0,
      sick: 0,
      cured: 0,
      dead: 0,
      mortality: g.mortality,
      dx: Math.random() * (speed * 2) - speed,
      dy: Math.random() * (speed * 2) - speed,
      quarantine: 0,
      mouth: 1,
      immunize: 0
    };
  },

  drawAll(context) {
    context.clearRect(0, 0, maxX, maxY);
    for (var i = 0; i < dots.length; i++) {
      drawOne(context, dots[i]);
    }
  },

  //------

  quarantine(amo) {
    //čtvrtina se nehýbe
    for (var i = 0; i < g.dotcount; i++) {
      if (i % 4 > amo) {
        /*
          dots[i].dx = 0;
          dots[i].dy = 0;
          */
        dots[i].quarantine = 1;
      } else {
        dots[i].quarantine = 0;
      }
    }
  },

  quarantine8(amo) {
    //čtvrtina se nehýbe
    for (var i = 0; i < g.dotcount; i++) {
      if (i % 8 > amo) {
        /*
                    dots[i].dx = 0;
                    dots[i].dy = 0;
                    */
        dots[i].quarantine = 1;
      } else {
        dots[i].quarantine = 0;
      }
    }
  },

  stats(bigtime, doBig) {
    var pct = g.dotcount / 100;
    var s = dots.reduce(
      (p, c) => {
        if (c.sane) {
          p.sane++;
        } else if (c.sick) {
          p.sick++;
        } else if (c.infected) {
          p.infected++;
        } else if (c.cured) {
          p.cured++;
        } else if (c.dead) {
          p.dead++;
        }
        return p;
      },
      { sane: 0, sick: 0, infected: 0, cured: 0, dead: 0 }
    );
    document.getElementById("sane").innerHTML =
      s.sane + "<br>" + Math.round(s.sane / pct) + " %";
    document.getElementById("cured").innerHTML =
      s.cured + "<br>" + Math.round(s.cured / pct) + " %";
    document.getElementById("infected").innerHTML =
      s.infected + "<br>" + Math.round(s.infected / pct) + " %";
    document.getElementById("dead").innerHTML =
      s.dead + "<br>" + Math.round(s.dead / pct) + " %";
    document.getElementById("sick").innerHTML =
      s.sick + "<br>" + Math.round(s.sick / pct) + " %";

    document.getElementById("bigtime").innerHTML =
      (bigtime ? bigtime + 1 : 0) +
      (g.quar ? '<br><span class="quarantine">ZÁKAZ</span>' : "");

    var quarantineUp = g.quarantineUpPct * g.dotcount;
    var quarantineDown = g.quarantineDownPct * g.dotcount;

    if (!g.quar && s.sick > quarantineUp) {
      g.quarantine8(7 - g.quarantinePower);
      g.quar = true;
    }
    if (g.quar && s.sick < quarantineDown) {
      g.quarantine8(7);
      g.quar = false;
    }

    //graf
    if (doBig === 0) {
      var v = 0;

      gctx.beginPath();
      gctx.moveTo(bigtime, 100 - v);
      gctx.lineTo(bigtime, 100 - v - s.infected / pct);
      gctx.strokeStyle = "#00ff00";
      gctx.stroke();
      v += s.infected / pct;

      gctx.beginPath();
      gctx.moveTo(bigtime, 100 - v);
      gctx.lineTo(bigtime, 100 - v - s.sick / pct);
      gctx.strokeStyle = "#ff0000";
      gctx.stroke();
      v += s.sick / pct;

      gctx.beginPath();
      gctx.moveTo(bigtime, 100 - v);
      gctx.lineTo(bigtime, 100 - v - s.sane / pct);
      gctx.strokeStyle = "#aaaaaa";
      gctx.stroke();
      v += s.sane / pct;

      gctx.beginPath();
      gctx.moveTo(bigtime, 100 - v);
      gctx.lineTo(bigtime, 100 - v - s.cured / pct);
      gctx.strokeStyle = "#0000ff";
      gctx.stroke();
      v += s.cured / pct;

      gctx.beginPath();
      gctx.moveTo(bigtime, 100 - v);
      gctx.lineTo(bigtime, 0);
      gctx.strokeStyle = "#000000";
      gctx.stroke();
    }

    if (s.infected + s.sick === 0) {
      //stop = true;
      g.stop();
    }
  },

  step() {
    g.bigstep++;
    g.smalltime++;
    g.stats(
      Math.floor(g.smalltime / g.bigtimeScale),
      g.smalltime % g.bigtimeScale
    );

    if (g.bigstep > g.bigstepCount) {
      g.bigstep = 0;
      g.bigtime++;
    }
    for (var i = 0; i < dots.length; i++) {
      var dot = dots[i];
      //if (dot.dead) continue;
      //        if (bigstep === 0) {
      //Průběh infekce
      if (dot.sick) {
        dot.sick += 0.1;
        if (dot.sick > 10) {
          dot.sick = 0;
          //smrt!
          if (Math.random() < dot.mortality) {
            dot.dead = 1;
          } else {
            dot.cured = 1;
            //uzdravení se zase hýbou
            dot.dx = Math.random() * (speed * 2) - speed;
            dot.dy = Math.random() * (speed * 2) - speed;
          }
        }
      } else if (dot.infected) {
        dot.sane = 0;
        dot.infected += 0.1;
        if (dot.infected > 10) {
          dot.infected = 0;
          dot.sick = 1;

          //nemocní se nehýbou
          if (!g.moveWhenSick) {
            dot.dx = 0;
            dot.dy = 0;
          }
        }
      }
      //        }

      //move
      var newx = dot.x + dot.dx;
      var newy = dot.y + dot.dy;
      if (newx < radius) {
        dot.dx *= -1;
      }
      if (newy < radius) {
        dot.dy *= -1;
      }
      if (newx > maxX - radius) {
        dot.dx *= -1;
      }
      if (newy > maxY - radius) {
        dot.dy *= -1;
      }

      //collision detection
      var test = dots.map((q, idx) => {
        if (idx == i) return false;
        if (q.dead) return false;
        return dist(q.x, q.y, newx, newy);
      });
      var hasCol = test.reduce((p, c) => (c ? true : p), false);
      if (hasCol && dot.dead === 0) {
        var which = test.reduce((p, c, idx) => (c ? idx : p), -1);
        //console.log(which, hasCol);
        if (which !== -1 && dots[which].dead === 0) {
          if (g.bouncing) {
            var ddx = dot.dx;
            var ddy = dot.dy;
            dot.dx = dots[which].dx;
            dot.dy = dots[which].dy;
            dots[which].dx = ddx;
            dots[which].dy = ddy;
          }

          //spread infection
          if (dots[which].infected || dots[which].sick) {
            if (dot.sane) {
              if (dots[which].infected) {
                if (Math.random() < g.transfer * dots[which].mouth) {
                  dot.infected = 1;
                }
              } else {
                if (
                  Math.random() <
                  (g.transfer / dots[which].sick) * dots[which].mouth
                ) {
                  dot.infected = 1;
                }
              }
            }
            if (dot.cured && !dot.immunize) {
              //reinfection

              if (dots[which].infected) {
                if (Math.random() < g.reinfection * dots[which].mouth) {
                  dot.cured = 0;
                  dot.infected = 5;
                  dot.mortality *= 5;
                  dot.immunize = 1;
                }
              } else {
                if (
                  Math.random() <
                  (g.reinfection / dots[which].sick) * dots[which].mouth
                ) {
                  dot.cured = 0;
                  dot.infected = 5;
                  dot.mortality *= 5;
                  dot.immunize = 1;
                }
              }
            }
          }
          if (dot.infected || dot.sick) {
            if (dots[which].sane) {
              if (dot.infected) {
                if (Math.random() < g.transfer * dot.mouth) {
                  dots[which].infected = 1;
                }
              } else {
                if (Math.random() < (g.transfer / dot.sick) * dot.mouth) {
                  dots[which].infected = 1;
                }
              }
            }
            if (dots[which].cured && !dots[which].immunize) {
              //reinfection
              if (dot.infected) {
                if (Math.random() < g.reinfection * dot.mouth) {
                  dots[which].cured = 1;
                  dots[which].infected = 5;
                  dots[which].mortality *= 5;
                  dots[which].immunize = 1;
                }
              } else {
                if (Math.random() < (g.reinfection / dot.sick) * dot.mouth) {
                  dots[which].cured = 1;
                  dots[which].infected = 5;
                  dots[which].mortality *= 5;
                  dots[which].immunize = 1;
                }
              }
            }
          }
        }
        //console.log("col", which);
      }

      if (dot.dead) {
        dot.dx = 0;
        dot.dy = 0;
      }
      newx = dot.x + dot.dx;
      newy = dot.y + dot.dy;
      if (!dot.quarantine) {
        dot.x = newx;
        dot.y = newy;
      }
    }
  },

  raf() {
    g.drawAll(context);
    if (!stop) g.step();
    if (g.bigtime / g.bigtimeScale < 500) requestAnimationFrame(g.raf);
  },

  sim() {
    //copy defaults
    for (let k in defaults) {
      g[k] = defaults[k];
    }
    //console.log(defaults);
    gctx.clearRect(0, 0, maxX, 100);
    //console.log("OMG", g.dotcount, dots);
    dots = [];
    for (var i = 0; i < g.dotcount; i++) {
      dots.push(g.genDot());
    }
    dots[0].sane = 0;
    dots[0].infected = 1;
    /*
    //čtvrtina má roušky
    for (var i = 0; i < g.dotcount; i++) {
      if (i % 4 > 2) {
        dots[i].mouth = g.mouthOut;
      }
    }
*/
    // g.start()
    stop = false;
  }
};
//obsluha slideru
var mkslid = (id, pct = false) => {
  //console.log(this.parent);
  pct = pct ? 100 : 1;
  $("span[data-value=" + id + "]").text(
    Math.floor(defaults[id] * pct * 10) / 10
  );
  $("#" + id).val(defaults[id]);
  $("#" + id).on("input", () => {
    defaults[id] = $("#" + id).val();
    if (id !== "dotcount") g[id] = defaults[id];
    $("span[data-value=" + id + "]").text(
      Math.floor(defaults[id] * pct * 10) / 10
    );
  });
};

window.onload = () => {
  console.log("GO");
  var myCanvas = document.getElementById("myCanvas");
  context = myCanvas.getContext("2d");
  var graph = document.getElementById("graph");
  gctx = graph.getContext("2d");
  $("#run").click(() => {
    g.sim();
    g.start();
  });
  $("#break").click(() => {
    if (stop) g.start();
    else g.stop();
  });

  mkslid("dotcount");
  mkslid("transfer", true);
  mkslid("reinfection", true);
  mkslid("mortality", true);
  mkslid("quarantineUpPct", true);
  mkslid("quarantineDownPct", true);
  mkslid("quarantinePower");

  g.sim();
  g.stats();
  g.stop();
  g.raf();
};
