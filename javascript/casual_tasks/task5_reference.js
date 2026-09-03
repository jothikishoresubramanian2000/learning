const highAge = (obj) => {
    const oldest = obj.reduce((a, b) => (b.age > a.age ? b : a));
    console.log(oldest.name);
};

const arr = [{name:"A",age:25},{name:"B",age:40},{name:"C",age:33}];
highAge(arr);
