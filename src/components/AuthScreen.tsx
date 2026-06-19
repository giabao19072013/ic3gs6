import React, { useState } from 'react';
import { 
  auth, 
  db, 
  defaultProfile, 
  getUserProfile, 
  getUserProfileByEmail,
  deleteUserProfile,
  saveUserProfile, 
  UserProfileData 
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import * as Lucide from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (userProfile: UserProfileData) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    // Helper to wrap promises with a timeout
    const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMessage: string, fallback?: T): Promise<T> => {
      let timeoutId: any;
      const timeoutPromise = new Promise<T>((resolve, reject) => {
        timeoutId = setTimeout(() => {
          if (fallback !== undefined) {
            resolve(fallback);
          } else {
            reject(new Error(errorMessage));
          }
        }, ms);
      });
      return Promise.race([
        promise.then((res) => {
          clearTimeout(timeoutId);
          return res;
        }),
        timeoutPromise
      ]);
    };

    try {
      const isSuperAdmin = (trimmedEmail === 'nguyenbao22013@gmail.com' || trimmedEmail === 'nguyenbao42013@gmail.com') && password === 'ngb19072013';
      let profile: UserProfileData | null = null;
      let firebaseUser = null;

      // 1. If it is the superadmin, bypass the network immediately to prevent any hanging/CORS blocks
      if (isSuperAdmin) {
        const staticAdminId = 'admin_' + trimmedEmail.split('@')[0];
        let foundProfile: UserProfileData | null = null;
        try {
          // Attempt a fast Firestore lookup (1.5 seconds max)
          foundProfile = await withTimeout(
            getUserProfileByEmail(trimmedEmail),
            1500,
            "Firestore timeout",
            null
          );
        } catch (e) {
          console.warn("Direct Firestore get for admin failed, using local fallback profile", e);
        }

        if (!foundProfile) {
          foundProfile = defaultProfile(staticAdminId, trimmedEmail, 'Nguyễn Gia Bảo', 'school_admin');
          try {
            saveUserProfile(staticAdminId, foundProfile);
          } catch (dbErr) {
            console.error("Could not background save profile to Firestore:", dbErr);
          }
        }
        
        onAuthSuccess(foundProfile);
        setLoading(false);
        return;
      }

      // 2. Try Firebase Auth standard flow as primary
      try {
        const userCredential = await withTimeout(
          signInWithEmailAndPassword(auth, trimmedEmail, password),
          15000,
          "Firebase Auth Timeout"
        );
        firebaseUser = userCredential.user;
        if (firebaseUser) {
          // Retrieve the authenticated profile
          profile = await withTimeout(
            getUserProfile(firebaseUser.uid),
            10000,
            "Firestore Profile Timeout",
            null
          );
          if (!profile) {
            // Self-heal: search if we have a profile stored under their email
            const emailProfile = await withTimeout(
              getUserProfileByEmail(trimmedEmail),
              10000,
              "Firestore recovery query timeout",
              null
            );
            if (emailProfile) {
              const oldId = emailProfile.id;
              profile = { ...emailProfile, id: firebaseUser.uid };
              // Optional: strip plain password on first direct Firebase Auth adoption
              delete profile.password;
              await saveUserProfile(firebaseUser.uid, profile);
              if (oldId && oldId !== firebaseUser.uid) {
                await deleteUserProfile(oldId);
              }
            } else {
              // Create default profile for authenticated user
              const assumedRole = (trimmedEmail === 'nguyenbao22013@gmail.com' || trimmedEmail === 'nguyenbao42013@gmail.com') ? 'school_admin' : 'student';
              const namePart = trimmedEmail.split('@')[0];
              const assumedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
              profile = defaultProfile(firebaseUser.uid, trimmedEmail, assumedName, assumedRole);
              await saveUserProfile(firebaseUser.uid, profile);
            }
          }
        }
      } catch (signInErr: any) {
        console.warn("Primary email sign-in failed. Checking Firestore-only fallback database lookup.", signInErr.code || signInErr);
        
        // Active database fallback lookup
        let foundProfile = await withTimeout(
          getUserProfileByEmail(trimmedEmail),
          10000,
          "Firestore query timeout",
          null
        );

        if (foundProfile && foundProfile.password === password) {
          profile = foundProfile;
        } else {
          // Direct credential verification failure
          throw new Error('Mật khẩu đăng nhập hoặc tài khoản không chính xác!');
        }
      }

      // If we didn't resolve the profile through first phase, let's check for newly-assigned pre-created profile conversion
      if (!profile) {
        const preProfile = await withTimeout(
          getUserProfileByEmail(trimmedEmail),
          10000,
          "Firestore preprofile query timeout",
          null
        );
        if (preProfile && preProfile.password === password) {
          try {
            // Attempt to register real credentials in Firebase Auth
            const signupCredential = await withTimeout(
              createUserWithEmailAndPassword(auth, trimmedEmail, password),
              15000,
              "Firebase signup timeout"
            );
            firebaseUser = signupCredential.user;

            // Successfully enrolled! Transfer the profile
            const updatedProfile = { ...preProfile, id: firebaseUser.uid };
            delete updatedProfile.password;
            
            await saveUserProfile(firebaseUser.uid, updatedProfile);
            if (preProfile.id && preProfile.id.startsWith('pre_')) {
              await deleteUserProfile(preProfile.id);
            }
            profile = updatedProfile;
          } catch (signupErr: any) {
            // If Auth throws operation-not-allowed, simply keep using the Firestore DB-backed credentials
            console.log("On-the-fly Auth signup disabled or timed out. Using DB credentials directly.");
            profile = preProfile;
          }
        } else {
          // Incorrect credentials or no account
          throw new Error('Mật khẩu đăng nhập hoặc tài khoản không chính xác!');
        }
      }

      if (profile) {
        onAuthSuccess(profile);
      } else {
        throw new Error('Không thể đăng nhập vào hệ thống.');
      }

    } catch (err: any) {
      console.error(err);
      let localizedError = err.message || 'Đã xảy ra lỗi không xác định.';
      if (err.code === 'auth/email-already-in-use') {
        localizedError = 'Địa chỉ email này đã được sử dụng bởi một tài khoản khác!';
      } else if (err.code === 'auth/invalid-email') {
        localizedError = 'Địa chỉ email không chính xác hoặc không đúng định dạng!';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        localizedError = 'Mật khẩu đăng nhập hoặc tài khoản không chính xác!';
      } else if (err.code === 'auth/user-not-found') {
        localizedError = 'Không tìm thấy tài khoản người dùng tương ứng với email này!';
      } else if (err.code === 'auth/operation-not-allowed') {
        localizedError = 'Hệ thống Auth của Firebase hiện đã khóa. Vui lòng thử lại hoặc phản hồi quản trị viên.';
      }
      setError(localizedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Hub Logo */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold mx-auto shadow-md shadow-indigo-600/20">
            <Lucide.GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Học Thuyết & Khảo Thí IC3 GS6</h2>
            <p className="text-xs text-slate-500 font-medium">Hệ thống học viên liên kết Firebase Cloud</p>
          </div>
        </div>

        {/* Display Status Errors or Credentials */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <Lucide.AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
            <p>{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <Lucide.CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
            <p className="whitespace-pre-line">{successMsg}</p>
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Địa chỉ Email cá nhân</label>
            <div className="relative">
              <Lucide.Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="ten-ban@vi-du.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 hover:border-slate-300"
                id="auth-email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Mật khẩu bảo quản</label>
            <div className="relative">
              <Lucide.Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 hover:border-slate-300"
                id="auth-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-xs shadow-sm transition duration-150 flex items-center justify-center gap-1.5"
            id="auth-submit-btn"
          >
            {loading ? (
              <Lucide.Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>Đăng Nhập <Lucide.ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-150">
          <p className="text-[10px] text-slate-400 font-medium">
            Phần tự đăng ký đã bị tắt theo yêu cầu quản lý. Toàn bộ tài khoản học viên và giáo viên khác sẽ được quản trị viên cấp phát trên hệ thống.
          </p>
        </div>

      </div>
    </div>
  );
}
