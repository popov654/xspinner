function Spinner(element) {
   
  if (element.xSpinnerInstance) {
     return element.xSpinnerInstance
  }
  
  var n = !isNaN(parseInt(element.innerHTML)) ? parseInt(element.innerHTML) : 0
  element.innerHTML = '<span class="value">' + n + '</span><span class="digits"></span>'

  var obj = {

    setValue: function(n) {
      
      if (this.timers.length) {
        setTimeout(this.setValue.bind(this), 100, n)
        return
      }
      
      var el = this.el
      var digits = []
      var number = n
      
      while (n > 0) {
        digits.unshift(n % 10);
        n = Math.floor(n / 10);
      }
      
      el.querySelector('.value').textContent = number;

      el.querySelector('.digits').innerHTML = '';
      var str = '';
      for (var i = 0; i < digits.length; i++) {
        str = '<span>9</span>';
        for (var j = 0; j < 10; j++) {
          str += '<span>' + j + '</span>';
        }
        str += '<span>0</span>';
        el.querySelector('.digits').innerHTML +=
          '<span class="col">' + str + "</span>";
      }

      function positionDigits(el, digits) {
        var els = el.querySelector('.digits').children;
        for (var i = 0; i < digits.length; i++) {
          if (els[i]) {
            els[i].style.top = -el.clientHeight * (digits[i] + 1) + "px";
          }
        }
      }

      positionDigits(el, digits);
    },

    SPEED: {
      VERYFAST: 900,
      FAST: 1200,
      MEDIUM: 1500,
      SLOW: 1800,
      VERYSLOW: 2100
    },

    animateTo: function(n, speed) {
      
      if (this.timers.length) {
        setTimeout(this.animateTo.bind(this), 100, n, speed);
        return;
      }
      
      var el = this.el;
      el.querySelector(".value").style.visibility = "hidden";
      el.querySelector(".digits").style.visibility = "visible";
      this.stopped = false;
      
      this.targetValue = n;

      var to = n;
      var from = parseInt(el.querySelector(".value"));
      if (isNaN(from)) from = 0;

      var delta = to - from;

      var duration = speed;
      var t = Math.max(10, Math.ceil(duration / delta));

      this.indecrementUntil(n, t);
    },

    indecrementUntil: function(n, t) {
      var el = this.el;
      if (el.querySelector(".value").textContent == n) {
        el.querySelector(".value").style.visibility = "visible";
        el.querySelector(".digits").style.visibility = "hidden";
        return;
      }
      var dir = parseInt(el.querySelector(".value").textContent) < n;
      var from =
        -((parseInt(el.querySelector(".value").textContent) % 10) + 1) * el.clientHeight;
      var to = from - el.clientHeight * (dir ? 1 : -1);

      var anim = this.anim.bind(this);

      var cols = Array.prototype.slice.call(el.querySelectorAll(".col"));

      var t0 = t;
      var steps_num = 10;

      var t = Math.ceil(t / steps_num);
      var dc = (to - from) / steps_num;

      for (var i = 0; i < cols.length; i++) {
        this.steps[i] = 0;
        this.timers[i] = null;
      }
      this.timers[cols.length - 1] = setTimeout(
        anim,
        t,
        el,
        n,
        t,
        t0,
        cols,
        steps_num,
        from,
        to,
        dc,
        cols.length - 1
      );
    },

    anim: function(el, n, t, t0, cols, steps_num, from, to, dc, index) {
      this.steps[index]++;
      cols[index].style.top = from + dc * this.steps[index] + "px";

      var anim = this.anim.bind(this)

      if (this.steps[index] < steps_num) {
        this.timers[index] = setTimeout(
          anim,
          t,
          el,
          n,
          t,
          t0,
          cols,
          steps_num,
          from,
          to,
          dc,
          index
        );
      } else {
        cols[index].style.top = to + "px";
        var flag = false;
        if (to == 0) {
          //console.log("overflow", index);
          cols[index].style.top = -el.clientHeight * 10 + "px";
          flag = true;
        } else if (to == -el.clientHeight * 11) {
          //console.log("overflow", index);
          cols[index].style.top = -el.clientHeight + "px";
          flag = true;
        }

        var dir = parseInt(el.querySelector(".value").textContent) < n

        if (dir && flag && el.querySelector(".value").textContent != n &&
            index == 0) {
          this.steps.unshift(0);
          this.timers.unshift(null);
          var newcol = document.createElement("div");
          newcol.className = "col";
          newcol.innerHTML = cols[0].innerHTML;
          newcol.style.top = -el.clientHeight + "px";
          cols[0].parentNode.insertBefore(newcol, cols[0]);
          cols.unshift(newcol);
          index++;
          //console.log("DIGITS NUMBER INCREASED");
        }
        if (!dir && to == -el.clientHeight &&
            el.querySelector(".value").textContent != n && index == 0) {
          this.steps.shift();
          this.timers.shift();
          cols[0].parentNode.removeChild(cols[0]);
          cols.shift();
          //console.log("DIGITS NUMBER DECREASED");
        }

        if (flag && el.querySelector(".value").textContent != n && index > 0) {
          var from2 = cols[index - 1].offsetTop;
          var to2 = from2 - el.clientHeight * (dir ? 1 : -1);

          this.timers[index - 1] = setTimeout(
            anim,
            t,
            el,
            n,
            t,
            t0,
            cols,
            steps_num,
            from2,
            to2,
            dc,
            index - 1
          );
        }
        if (!flag && el.querySelector(".value").textContent != n) {
          el.querySelector(".value").textContent =
            parseInt(el.querySelector(".value").textContent) + (dir ? 1 : -1);
          if (!this.stopped) {
            this.indecrementUntil(n, t);
          } else {
            this.doStop();
          }
        }
        if (el.querySelector(".value").textContent == n) {
           this.doStop();
        }
      }
    },
    
    doStop: function() {
      for (var i = 0; i < this.timers.length; i++) {
        clearTimeout(this.timers[i]);
      }
      this.timers = [];
      this.steps = [];
      this.stopped = false;
    },

    stop: function(skip) {
      if (!this.timers.length) return
      this.stopped = true
      if (skip) {
         this.setValue(this.targetValue)
         delete this.targetValue
      }
    },

    stopped: false,
    el: element,
    timers: [],
    steps: []

  }
  
  obj.setValue(n)
  
  return obj
}

Spinner.SPEED = {
  VERYFAST: 900,
  FAST: 1200,
  MEDIUM: 1500,
  SLOW: 1800,
  VERYSLOW: 2100
}