# Challenge
#Create a list of 5 numbers. Remove the smallest number, 
# then add 100 to the end. Print the sum of all numbers using sum(
a = [1,2,3,4,5]
a.remove(min(a))
a.append(100)
print(sum(a))