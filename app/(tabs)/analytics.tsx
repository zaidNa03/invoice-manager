import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function AnalyticsScreen() {
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenue Overview</Text>
          <LineChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  data: [0, 0, 0, 0, 0, 0],
                },
              ],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
            bezier
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <Text style={styles.statValue}>$0.00</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Outstanding</Text>
            <Text style={styles.statValue}>$0.00</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
  },
});