import csv
import numpy as np
from matplotlib import pyplot as plt
import matplotlib.mlab as mlab

degrees = []
inDegrees = []
outDegrees = []
wDegrees = []
wInDegrees = []
wOutDegrees = []
betweennesses = []
clusterings = []
undirected_betweennesses = []
effectiveSizes = []

def getData():

    with open('../data/Degree.csv', 'r') as csvfile:
        data = csv.reader(csvfile, delimiter=',')
        next(data)
                
        for row in data:
            degree = int(row[0])
            inDegree = int(row[1])
            outDegree = int(row[2])            
            wDegree = int(row[3])
            wInDegree = int(row[4])
            wOutDegree = int(row[5])
            betweenness = float(row[6])
            clustering = float(row[7])
            undirected_betweenness = float(row[8])
            
            degrees.append(degree)
            inDegrees.append(inDegree)
            outDegrees.append(outDegree)
            wDegrees.append(wDegree)
            wInDegrees.append(wInDegree)
            wOutDegrees.append(wOutDegree)
            betweennesses.append(betweenness)
            clusterings.append(clustering)
            undirected_betweennesses.append(undirected_betweenness)
            effectiveSizes.append(calcEffectiveSize(degree,clustering))                    
            

def normDistribution(values):
    plt.plot(values,mlab.normpdf(values, np.mean(values), np.std(values)))
    plt.show()

def frequencyDistribution(values):
    plt.hist(values, bins=30)
    plt.show()

def correlations(list1, list2):
        print(np.corrcoef(list1, list2)[0,1])

def calcEffectiveSize(degree, clustering):
    size = 1 - ((degree - 1) / degree) * clustering
    return size

def scatter(list1, list2):
    plt.xlabel('Directed Betweenness Centrality', fontsize=12)
    plt.ylabel('Degree', fontsize=12)
    plt.scatter(list1, list2, c=['red'])
    plt.show()

#values = sorted(degrees)
#normDistribution(values)
#frequencyDistribution(values)

getData()

print("Pearson Correlation Coeficients: ")

print("Degree and Betweenness Centrality")
correlations(degrees, betweennesses)

print("Weighted Degree and Betweenness Centrality")
correlations(wDegrees, betweennesses)

print("Weighted Indegree and Weighted Outdegree")
correlations(wInDegrees, wOutDegrees)

scatter(betweennesses, degrees)

#normDistribution(sorted(wDegrees))
#frequencyDistribution(sorted(wDegrees))