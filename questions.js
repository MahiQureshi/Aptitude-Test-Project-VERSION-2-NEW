const QUESTIONS = [
  {id:1,category:"Quantitative",difficulty:"Easy",text:"A train travels 120 km in 2 hours. What is its average speed?",options:["40 km/h","50 km/h","60 km/h","80 km/h"],answer:2,explanation:"Speed = Distance ÷ Time = 120 ÷ 2 = 60 km/h."},
  {id:2,category:"Quantitative",difficulty:"Easy",text:"What is 25% of 240?",options:["40","50","60","80"],answer:2,explanation:"25% = 1/4, so 240 ÷ 4 = 60."},
  {id:3,category:"Quantitative",difficulty:"Medium",text:"A product costs ₹800 and is sold at a 15% profit. What is the selling price?",options:["₹880","₹900","₹920","₹940"],answer:2,explanation:"Profit = 15% of 800 = 120. Selling price = 800 + 120 = ₹920."},
  {id:4,category:"Quantitative",difficulty:"Medium",text:"If the ratio of boys to girls is 3:2 and there are 30 boys, how many girls are there?",options:["15","20","24","25"],answer:1,explanation:"3 parts = 30, so 1 part = 10. Girls = 2 parts = 20."},
  {id:5,category:"Quantitative",difficulty:"Hard",text:"What is the probability of getting a sum of 7 when two fair dice are rolled?",options:["1/12","1/9","1/6","1/3"],answer:2,explanation:"There are 6 combinations producing 7 out of 36 outcomes, so 6/36 = 1/6."},
  {id:6,category:"Quantitative",difficulty:"Medium",text:"A can complete a job in 10 days and B in 15 days. How long together?",options:["5 days","6 days","8 days","12 days"],answer:1,explanation:"Combined rate = 1/10 + 1/15 = 1/6, so they need 6 days."},
  {id:7,category:"Logical",difficulty:"Easy",text:"Find the next number: 2, 4, 8, 16, ?",options:["20","24","30","32"],answer:3,explanation:"Each number is multiplied by 2. The next number is 32."},
  {id:8,category:"Logical",difficulty:"Medium",text:"If CAT is coded as DBU, how is DOG coded?",options:["EPH","EOG","FPH","DPG"],answer:0,explanation:"Each letter moves one position forward: D→E, O→P, G→H."},
  {id:9,category:"Logical",difficulty:"Medium",text:"All roses are flowers. Some flowers fade quickly. Which conclusion is definitely true?",options:["All roses fade quickly","Some roses fade quickly","Roses are flowers","No roses fade"],answer:2,explanation:"The first statement directly establishes that roses are flowers."},
  {id:10,category:"Logical",difficulty:"Hard",text:"A person walks 5 km north, then 3 km east. In which general direction is the person from the start?",options:["North-west","North-east","South-east","South-west"],answer:1,explanation:"Moving north and east places the person to the north-east of the starting point."},
  {id:11,category:"Logical",difficulty:"Easy",text:"Which one does not belong: Apple, Mango, Carrot, Banana?",options:["Apple","Mango","Carrot","Banana"],answer:2,explanation:"Carrot is a vegetable; the others are fruits."},
  {id:12,category:"Logical",difficulty:"Medium",text:"If today is Wednesday, what day will it be 10 days from today?",options:["Friday","Saturday","Sunday","Monday"],answer:1,explanation:"10 mod 7 = 3. Wednesday + 3 days = Saturday."},
  {id:13,category:"Verbal",difficulty:"Easy",text:"Choose the synonym of 'Rapid'.",options:["Slow","Quick","Weak","Late"],answer:1,explanation:"Rapid means fast or quick."},
  {id:14,category:"Verbal",difficulty:"Easy",text:"Choose the antonym of 'Ancient'.",options:["Old","Historic","Modern","Former"],answer:2,explanation:"Modern is the opposite of ancient."},
  {id:15,category:"Verbal",difficulty:"Medium",text:"Choose the grammatically correct sentence.",options:["She don't like tea.","She doesn't likes tea.","She doesn't like tea.","She not like tea."],answer:2,explanation:"With 'doesn't', the main verb remains in its base form: like."},
  {id:16,category:"Verbal",difficulty:"Medium",text:"Fill in the blank: He has been working here ___ 2022.",options:["for","since","from","by"],answer:1,explanation:"'Since' is used with a specific starting point in time."},
  {id:17,category:"Verbal",difficulty:"Hard",text:"Choose the closest meaning of 'meticulous'.",options:["Careless","Very careful","Angry","Confused"],answer:1,explanation:"Meticulous means extremely careful and precise."},
  {id:18,category:"Verbal",difficulty:"Medium",text:"Choose the correct word: The manager asked the team to ___ the report.",options:["revise","revision","revising","revised"],answer:0,explanation:"After 'asked ... to', the base verb 'revise' is correct."},
  {id:19,category:"Logical",difficulty:"Hard",text:"Complete the series: AZ, BY, CX, DW, ?",options:["EV","FU","EX","EW"],answer:0,explanation:"The first letter moves forward and the second moves backward: A-Z, B-Y, C-X, D-W, E-V."},
  {id:20,category:"Quantitative",difficulty:"Medium",text:"The average of 10, 20, 30, 40 and 50 is:",options:["20","25","30","35"],answer:2,explanation:"Sum = 150 and 150 ÷ 5 = 30."}
];

function getQuestionSet(category="All Categories", difficulty="Mixed"){
  let pool = QUESTIONS.filter(q => category === "All Categories" || q.category === category);
  if(difficulty !== "Mixed"){
    const filtered = pool.filter(q => q.difficulty === difficulty);
    if(filtered.length >= 20) pool = filtered;
  }
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(20,pool.length));
}
