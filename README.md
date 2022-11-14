# xspinner
A simple rotating spinner/counter

Create a new spinner object using `let spinner = new Spinner(element)`, then use:

`spinner.setValue(n)` to set the spinner value instantly

`spinner.animateTo(n, duration)` to make a smooth spin/transition

`spinner.stop()` to stop the transition and save the currently displayed value

`spinner.stop(true)` to stop the transition and set the final (target) value instantly
