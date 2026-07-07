sentence = input("Enter the sentence: \n")
sentence = sentence.lower()
sentence = sentence.split()

done_words = {}

for words in sentence:

    count = sentence.count(words)
    
    if words not in done_words:
        done_words[words] = count

print(done_words)
