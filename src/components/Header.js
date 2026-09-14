import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export const Header = ({ title, subtitle, navigation, showBack = false }) => {
  const { user, isAuthenticated, isTeacher, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          {showBack && navigation && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.title}>{title || 'Blog'}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.actions}>
          {isAuthenticated ? (
            <View style={styles.userSection}>
              <View
                style={[
                  styles.roleBadge,
                  isTeacher ? styles.teacherBadge : styles.studentBadge
                ]}
              >
                <Ionicons
                  name={isTeacher ? 'school-outline' : 'person-outline'}
                  size={12}
                  color={isTeacher ? colors.teacherText : colors.studentText}
                />
                <Text
                  style={[
                    styles.roleText,
                    isTeacher ? styles.teacherText : styles.studentText
                  ]}
                >
                  {isTeacher ? 'Docente' : 'Estudante'}
                </Text>
              </View>
              <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            navigation && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
              >
                <Ionicons name="log-in-outline" size={16} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>Entrar</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backButton: {
    marginRight: 10,
    padding: 4
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  teacherBadge: {
    backgroundColor: colors.teacherBadge
  },
  studentBadge: {
    backgroundColor: colors.studentBadge
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600'
  },
  teacherText: {
    color: colors.teacherText
  },
  studentText: {
    color: colors.studentText
  },
  logoutButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.dangerLight
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  }
});
