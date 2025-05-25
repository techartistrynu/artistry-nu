import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subHeader: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#7f8c8d',
  },
  certificateContainer: {
    border: '2px solid #3498db',
    padding: 30,
    borderRadius: 10,
  },
  certificateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 1.5,
  },
  recipientName: {
    fontSize: 28,
    textAlign: 'center',
    marginVertical: 30,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  achievementText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#16a085',
  },
  detailsContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    fontSize: 14,
  },
  signatureLine: {
    marginTop: 60,
    borderTop: '1px solid #34495e',
    width: 200,
    alignSelf: 'center',
  },
  signatureText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export const CertificateTemplate = ({
  name,
  score,
  rank,
  tournamentTitle,
}: {
  name: string;
  score: string;
  rank: string;
  tournamentTitle: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* You can add your logo here */}
      {/* <Image src="/path/to/logo.png" style={styles.logo} /> */}
      
      <Text style={styles.header}>Certificate of Achievement</Text>
      <Text style={styles.subHeader}>{tournamentTitle}</Text>
      
      <View style={styles.certificateContainer}>
        <Text style={styles.certificateText}>
          This certificate is proudly presented to
        </Text>
        
        <Text style={styles.recipientName}>{name}</Text>
        
        <Text style={styles.achievementText}>
          For achieving {rank === '1' ? '1st' : rank === '2' ? '2nd' : rank === '3' ? '3rd' : `${rank}th`} place
        </Text>
        
        <Text style={styles.certificateText}>
          with a score of {score} in the {tournamentTitle} competition.
        </Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailItem}>Date: {new Date().toLocaleDateString()}</Text>
        <Text style={styles.detailItem}>Rank: {rank}</Text>
        <Text style={styles.detailItem}>Score: {score}</Text>
      </View>
      
      <View style={styles.signatureLine}>
        <Text style={styles.signatureText}>Authorized Signature</Text>
      </View>
    </Page>
  </Document>
);