const pr = { id: "PR-002", show() {console.log(this.id)} }

pr.show()

let assPr = pr.show
assPr()

assPr = pr.show.bind(pr)
assPr()
