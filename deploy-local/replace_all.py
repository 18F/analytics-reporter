from sys import argv

with open(argv[1],"r") as f:
    text = f.read()

text = text.replace("$HOME/Documents/projects/analytics-reporter/envs/","$HOME/Documents/projects/analytics-reporter/deploy-local/envs/")

with open(argv[1],"w") as f:
    f.write(text)
