'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Calendar, Edit3, Key, Trash2, FileText, MessageSquare, Crown, ChevronRight } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthContext, useSupabaseContext } from '@/lib/context'
import { useVipStatus } from '@/lib/hooks'
import { updateMyProfile, changePassword, deleteMyAccount, checkNicknameDuplicate } from '@/lib/actions/profiles'
import { formatShortDate } from '@/lib/utils/format'
import styles from './page.module.css'

interface MyPost {
  id: number
  title: string
  board_type: 'free' | 'vip'
  created_at: string
  view_count: number
}

interface MyComment {
  id: number
  content: string
  post_id: number
  post_title: string
  created_at: string
}

export default function MyPage() {
  const router = useRouter()
  const supabase = useSupabaseContext()
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuthContext()
  const { isVip } = useVipStatus()

  // State
  const [activeTab, setActiveTab] = useState<'info' | 'posts' | 'comments' | 'security'>('info')
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // My posts & comments
  const [myPosts, setMyPosts] = useState<MyPost[]>([])
  const [myComments, setMyComments] = useState<MyComment[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  // Initialize nickname
  useEffect(() => {
    if (profile?.nickname) {
      setNickname(profile.nickname)
    }
  }, [profile])

  // Fetch my posts
  const fetchMyPosts = useCallback(async () => {
    if (!user) return
    setIsLoadingPosts(true)

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, board_type, created_at, view_count')
      .eq('author_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      setMyPosts(data as MyPost[])
    }
    setIsLoadingPosts(false)
  }, [supabase, user])

  // Fetch my comments
  const fetchMyComments = useCallback(async () => {
    if (!user) return
    setIsLoadingComments(true)

    const { data, error } = await supabase
      .from('comments')
      .select('id, content, post_id, created_at, posts!post_id(title)')
      .eq('author_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      setMyComments(
        data.map((c) => {
          const post = c.posts as { title: string } | { title: string }[] | null
          const postTitle = Array.isArray(post) ? post[0]?.title : post?.title
          return {
            id: c.id,
            content: c.content,
            post_id: c.post_id,
            post_title: postTitle || '삭제된 게시글',
            created_at: c.created_at,
          }
        })
      )
    }
    setIsLoadingComments(false)
  }, [supabase, user])

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'posts') {
      fetchMyPosts()
    } else if (activeTab === 'comments') {
      fetchMyComments()
    }
  }, [activeTab, fetchMyPosts, fetchMyComments])

  // Handle nickname change
  const handleNicknameSubmit = async () => {
    if (!nickname.trim()) {
      setNicknameError('닉네임을 입력해주세요.')
      return
    }

    if (nickname.trim().length < 2 || nickname.trim().length > 20) {
      setNicknameError('닉네임은 2~20자여야 합니다.')
      return
    }

    if (nickname.trim() === profile?.nickname) {
      setIsEditing(false)
      return
    }

    setIsSubmitting(true)
    setNicknameError('')

    // Check duplicate
    const duplicateResult = await checkNicknameDuplicate(nickname.trim(), user?.id)
    if (duplicateResult.data) {
      setNicknameError('이미 사용 중인 닉네임입니다.')
      setIsSubmitting(false)
      return
    }

    const result = await updateMyProfile({ nickname: nickname.trim() })

    if (result.error) {
      setNicknameError(result.error)
    } else {
      await refreshProfile() // 프로필 새로고침
      setSuccessMessage('닉네임이 변경되었습니다.')
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    }

    setIsSubmitting(false)
  }

  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)
    setPasswordError('')

    const result = await changePassword(newPassword)

    if (result.error) {
      setPasswordError(result.error)
    } else {
      setSuccessMessage('비밀번호가 변경되었습니다.')
      setShowPasswordForm(false)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccessMessage(''), 3000)
    }

    setIsSubmitting(false)
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '회원탈퇴') {
      return
    }

    setIsSubmitting(true)

    const result = await deleteMyAccount()

    if (result.error) {
      alert(result.error)
    } else {
      alert('회원 탈퇴가 완료되었습니다.')
      router.push('/')
    }

    setIsSubmitting(false)
  }

  // Loading state
  if (authLoading) {
    return (
      <PageLayout>
        <div className={styles.main}>
          <Navbar />
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>로딩 중...</span>
          </div>
          <Footer />
        </div>
      </PageLayout>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <PageLayout>
        <div className={styles.main}>
          <Navbar />
          <div className={styles.authRequired}>
            <div className={styles.authCard}>
              <User size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h2>로그인이 필요합니다</h2>
              <p>마이페이지에 접근하려면 로그인해주세요.</p>
              <Link href="/login" className={styles.loginBtn}>
                로그인하기
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className={styles.main}>
        <Navbar />

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>마이페이지</h1>
            <p className={styles.subtitle}>내 정보 및 활동 관리</p>
          </div>
        </section>

        <div className={styles.container}>
          {/* Success Message */}
          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}

          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>
              {profile?.nickname?.charAt(0) || 'U'}
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>
                {profile?.nickname || '사용자'}
                {isVip && (
                  <span className={styles.vipBadge}>
                    <Crown size={12} />
                    VIP
                  </span>
                )}
              </div>
              <div className={styles.profileEmail}>{user.email}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'info' ? styles.active : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <User size={16} />
              기본 정보
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'posts' ? styles.active : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <FileText size={16} />
              내 글
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'comments' ? styles.active : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <MessageSquare size={16} />
              내 댓글
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'security' ? styles.active : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Key size={16} />
              보안
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className={styles.infoSection}>
                {/* Nickname */}
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <User size={16} />
                    닉네임
                  </div>
                  {isEditing ? (
                    <div className={styles.editForm}>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className={styles.input}
                        placeholder="닉네임 (2~20자)"
                        maxLength={20}
                      />
                      <div className={styles.editActions}>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setNickname(profile?.nickname || '')
                            setNicknameError('')
                          }}
                          className={styles.cancelBtn}
                          disabled={isSubmitting}
                        >
                          취소
                        </button>
                        <button
                          onClick={handleNicknameSubmit}
                          className={styles.saveBtn}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? '저장 중...' : '저장'}
                        </button>
                      </div>
                      {nicknameError && (
                        <p className={styles.errorText}>{nicknameError}</p>
                      )}
                    </div>
                  ) : (
                    <div className={styles.infoValue}>
                      <span>{profile?.nickname || '-'}</span>
                      <button
                        onClick={() => setIsEditing(true)}
                        className={styles.editBtn}
                      >
                        <Edit3 size={14} />
                        수정
                      </button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <Mail size={16} />
                    이메일
                  </div>
                  <div className={styles.infoValue}>
                    <span>{user.email}</span>
                  </div>
                </div>

                {/* Join Date */}
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <Calendar size={16} />
                    가입일
                  </div>
                  <div className={styles.infoValue}>
                    <span>{profile?.created_at ? formatShortDate(profile.created_at) : '-'}</span>
                  </div>
                </div>

                {/* Role */}
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <Crown size={16} />
                    등급
                  </div>
                  <div className={styles.infoValue}>
                    <span className={styles.roleBadge}>
                      {profile?.role === 'admin' || profile?.role === 'superadmin'
                        ? '관리자'
                        : profile?.role === 'vip'
                        ? 'VIP'
                        : profile?.role === 'moderator'
                        ? '운영진'
                        : '일반 회원'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className={styles.listSection}>
                {isLoadingPosts ? (
                  <div className={styles.loadingSmall}>
                    <div className={styles.spinner} />
                  </div>
                ) : myPosts.length === 0 ? (
                  <div className={styles.empty}>작성한 글이 없습니다.</div>
                ) : (
                  <ul className={styles.list}>
                    {myPosts.map((post) => (
                      <li key={post.id}>
                        <Link
                          href={`/community/${post.board_type}/${post.id}`}
                          className={styles.listItem}
                        >
                          <div className={styles.listMain}>
                            <span className={styles.listBadge}>
                              {post.board_type === 'vip' ? 'VIP' : '자유'}
                            </span>
                            <span className={styles.listTitle}>{post.title}</span>
                          </div>
                          <div className={styles.listMeta}>
                            <span>{formatShortDate(post.created_at)}</span>
                            <span>조회 {post.view_count}</span>
                            <ChevronRight size={16} />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className={styles.listSection}>
                {isLoadingComments ? (
                  <div className={styles.loadingSmall}>
                    <div className={styles.spinner} />
                  </div>
                ) : myComments.length === 0 ? (
                  <div className={styles.empty}>작성한 댓글이 없습니다.</div>
                ) : (
                  <ul className={styles.list}>
                    {myComments.map((comment) => (
                      <li key={comment.id}>
                        <Link
                          href={`/community/free/${comment.post_id}`}
                          className={styles.listItem}
                        >
                          <div className={styles.listMain}>
                            <span className={styles.commentContent}>
                              {comment.content.length > 50
                                ? comment.content.slice(0, 50) + '...'
                                : comment.content}
                            </span>
                            <span className={styles.commentPostTitle}>
                              @ {comment.post_title}
                            </span>
                          </div>
                          <div className={styles.listMeta}>
                            <span>{formatShortDate(comment.created_at)}</span>
                            <ChevronRight size={16} />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className={styles.securitySection}>
                {/* Password Change */}
                <div className={styles.securityCard}>
                  <div className={styles.securityHeader}>
                    <div className={styles.securityTitle}>
                      <Key size={18} />
                      비밀번호 변경
                    </div>
                    {!showPasswordForm && (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className={styles.actionBtn}
                      >
                        변경하기
                      </button>
                    )}
                  </div>

                  {showPasswordForm && (
                    <div className={styles.passwordForm}>
                      <div className={styles.formGroup}>
                        <label>새 비밀번호</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={styles.input}
                          placeholder="6자 이상"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>비밀번호 확인</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={styles.input}
                          placeholder="비밀번호 확인"
                        />
                      </div>
                      {passwordError && (
                        <p className={styles.errorText}>{passwordError}</p>
                      )}
                      <div className={styles.formActions}>
                        <button
                          onClick={() => {
                            setShowPasswordForm(false)
                            setNewPassword('')
                            setConfirmPassword('')
                            setPasswordError('')
                          }}
                          className={styles.cancelBtn}
                        >
                          취소
                        </button>
                        <button
                          onClick={handlePasswordChange}
                          className={styles.saveBtn}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? '변경 중...' : '변경하기'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete Account */}
                <div className={`${styles.securityCard} ${styles.dangerCard}`}>
                  <div className={styles.securityHeader}>
                    <div className={styles.securityTitle}>
                      <Trash2 size={18} />
                      회원 탈퇴
                    </div>
                    {!showDeleteConfirm && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className={styles.dangerBtn}
                      >
                        탈퇴하기
                      </button>
                    )}
                  </div>

                  {showDeleteConfirm && (
                    <div className={styles.deleteForm}>
                      <p className={styles.warningText}>
                        회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
                        <br />
                        탈퇴를 원하시면 아래에 <strong>&quot;회원탈퇴&quot;</strong>를 입력해주세요.
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className={styles.input}
                        placeholder="회원탈퇴"
                      />
                      <div className={styles.formActions}>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false)
                            setDeleteConfirmText('')
                          }}
                          className={styles.cancelBtn}
                        >
                          취소
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          className={styles.deleteBtn}
                          disabled={deleteConfirmText !== '회원탈퇴' || isSubmitting}
                        >
                          {isSubmitting ? '처리 중...' : '탈퇴하기'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </PageLayout>
  )
}
