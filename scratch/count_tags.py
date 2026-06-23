import sys

path = r"c:\Users\seanh\Desktop\Sean\Claude Cowork Projects (MP)\Art Learning Tutor\socratic-tutor\src\app\instructor\[sessionId]\analysis\page.tsx"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"File length: {len(content)}")
print(f"Braces {{: {content.count('{')}")
print(f"Braces }}: {content.count('}')}")
print(f"Parens (: {content.count('(')}")
print(f"Parens ): {content.count(')')}")
print(f"Frag <>: {content.count('<>')}")
print(f"Frag </>: {content.count('</>')}")
print(f"Div <div>: {content.count('<div')}")
print(f"Div </div>: {content.count('</div>')}")
