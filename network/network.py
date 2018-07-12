import csv
import networkx as nx
from matplotlib import pyplot as plt

def loadGraph():

    with open('../data/Transfers_15-17.csv', 'r') as csvfile:
        data = csv.reader(csvfile, delimiter=',')
        next(data)        
        G = nx.DiGraph()
        for row in data:
            player = row[0].decode("utf-8")
            source = row[1].decode("utf-8")
            target = row[2].decode("utf-8")
            value = row[3]
            G.add_edge(source, target, weight=6, player=player)
    return G

def drawGraph(graph):
    pos = nx.spring_layout(graph, iterations = 100)
    nx.draw_networkx(graph, pos)

    edge_labels = nx.get_edge_attributes(graph, 'player')
    nx.draw_networkx_edge_labels(graph, pos, labels = edge_labels)

    plt.show()

def showStats(graph):
    print "Nodes: " + str(len(graph.nodes(data=True)))
    print "Edges: " + str(len(graph.edges(data=True)))
    #print "Triangles " + nx.triangles(graph)
    sp = nx.shortest_path(graph, source="APOEL Nicosia", target="Juventus FC")
    print(sp)

G = loadGraph()
showStats(G)
#drawGraph(G)