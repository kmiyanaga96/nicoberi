const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// 1. Add import for the new helper function
code = code.replace(
  /import \{ toggleStaffActive/,
  `import { calculateAgeAndGrade } from '@/utils/dateHelper'\nimport { toggleStaffActive`
);

// 2. Add birthdate input to "Add Child" (新規児童の登録)
const formAdditionsAdd = `
                      <div className="col-span-2">
                        <label className="block text-[10px] text-muted-foreground uppercase mb-1">生年月日</label>
                        <input type="date" name="birthdate" className="w-full bg-background border border-border/50 text-sm px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                      </div>
                      <div className="md:col-span-2">`;
code = code.replace(
  /<div className="md:col-span-2">\r?\n                        <label className="block text-\[10px\] text-muted-foreground uppercase mb-1">施設・学校名<\/label>/,
  formAdditionsAdd
);

// Wait, the 新規児童 (children registration) is NOT what I matched. I matched the "施設登録" (facility registration) form!
// Ah, let's fix it via regex more explicitly.

// For "New Child Registration" form, gender is usually there.
// Let's find gender select box in 新規児童の登録.
/*
                      <div>
                        <label className="block text-[10px] text-muted-foreground uppercase mb-1">性別</label>
                        <select name="gender" ...
*/
const newChildAdd = `
                      <div>
                        <label className="block text-[10px] text-muted-foreground uppercase mb-1">生年月日</label>
                        <input type="date" name="birthdate" className="w-full bg-background border border-border/50 text-sm px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground uppercase mb-1">性別</label>`;
code = code.replace(
  /                      <div>\r?\n                        <label className="block text-\[10px\] text-muted-foreground uppercase mb-1">性別<\/label>/,
  newChildAdd
);

// For "Edit Child Registration"
const editChildAdd = `
                          <div>
                            <label className="block text-[10px] text-muted-foreground uppercase mb-1">生年月日</label>
                            <input type="date" name="birthdate" defaultValue={child.birthdate || ''} className="w-full bg-background border border-border/50 text-sm px-4 py-2 rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-muted-foreground uppercase mb-1">性別</label>`;
code = code.replace(
  /                          <div>\r?\n                            <label className="block text-\[10px\] text-muted-foreground uppercase mb-1">性別<\/label>/,
  editChildAdd
);


// 3. Render Grade and Age badge in the Children List (AutoCloseDetails).
/*
                            <div>
                              <span className="font-bold text-sm block">{child.last_name} {child.first_name}<\/span>
                              <span className="block text-\[10px\] text-muted-foreground mt-0.5">{child.sei} {child.mei}<\/span>
*/
const renderAgeGrade = `
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm block">{child.last_name} {child.first_name}</span>
                                {(() => {
                                  const { age, grade } = calculateAgeAndGrade(child.birthdate);
                                  if (!grade) return null;
                                  return (
                                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">
                                      {grade} ({age}歳)
                                    </span>
                                  )
                                })()}
                              </div>
                              <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">{child.sei} {child.mei}</span>`;
code = code.replace(
  /                            <div>\r?\n                              <span className="font-bold text-sm block">\{child.last_name\} \{child.first_name\}<\/span>\r?\n                              <span className="block text-\[10px\] text-muted-foreground font-normal mt-0.5">\{child.sei\} \{child.mei\}<\/span>/,
  renderAgeGrade
);

fs.writeFileSync('src/app/dashboard/page.tsx', code);
