from sys import argv

with open(argv[1],"r") as f:
    text = f.read()

#text = text.replace("$HOME/envs/projects/","$HOME/app/")
#text = text.replace("$HOME/analytics-reporter/bin/analytics","$HOME/app/bin/analytics")

text = text.replace("$HOME/envs/","$HOME/app/deploy-GovCloud/envs/")

with open(argv[1],"w") as f:
    f.write(text)
