import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu as Dropdown,
  DropdownMenuContent as Content,
  DropdownMenuItem as Item,
  DropdownMenuGroup as Group,
  DropdownMenuLabel as Label,
  DropdownMenuSeparator as Separator,
  DropdownMenuTrigger as Trigger,
} from '@/components/ui/dropdown-menu'
import { Search, Heart, ShoppingBag, ClipboardList, ShieldAlert, LogOut, User } from 'lucide-react'

export default function TopBar({
  cartCount,
  wishlistCount,
  searchTerm,
  onSearchChange,
  onCartClick,
  onWishlistClick,
  onOrdersClick,
  onLoginClick,
  onSignUpClick,
  user,
  onLogout,
  onGoToAdmin,
  onProfileClick
}) {
  const isAdmin = user?.profile?.role === 'admin'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-6 md:px-8">
        
        {/* Search Input */}
        <div className="relative w-full max-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search Products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs uppercase tracking-wider bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-black transition-all placeholder-zinc-400"
          />
        </div>

        {/* Brand/Logo for small screens if needed, otherwise layout spacing */}
        <div className="md:hidden font-bold tracking-tight text-sm">STUDIO</div>

        {/* Utility Actions */}
        <div className="flex items-center gap-5">
          {/* Wishlist */}
          <button
            className="relative p-2 hover:bg-zinc-50 rounded-full transition-colors group flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold"
            type="button"
            onClick={onWishlistClick}
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <Heart className="h-4.5 w-4.5 text-zinc-700 group-hover:scale-105 transition-transform" />
            <span className="hidden sm:inline">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            className="relative p-2 hover:bg-zinc-50 rounded-full transition-colors group flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold"
            type="button"
            onClick={onCartClick}
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingBag className="h-4.5 w-4.5 text-zinc-700 group-hover:scale-105 transition-transform" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              className="p-2 rounded-full bg-zinc-950 text-white hover:bg-zinc-700 transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold"
              type="button"
              onClick={onGoToAdmin}
            >
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          {/* Authentication States */}
          {user ? (
            <Dropdown>
              <Trigger className="focus:outline-none cursor-pointer">
                <div className="flex items-center gap-2 hover:opacity-85 transition-opacity">
                  <Avatar className="h-8 w-8 border border-zinc-200 shadow-sm">
                    <AvatarImage src={user.profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-zinc-950 text-white text-xs font-bold uppercase">
                      {user.profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-xs font-bold text-zinc-800">
                    {user.profile?.full_name || 'My Profile'}
                  </span>
                </div>
              </Trigger>
              <Content align="end" className="w-56 rounded-xl border border-zinc-100 shadow-xl bg-white p-1">
                <Group>
                  <Label className="px-3 py-2 text-xs font-bold text-zinc-900 block truncate">
                    <div>{user.profile?.full_name || 'User'}</div>
                    <div className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">{user.email}</div>
                  </Label>
                  <Separator className="bg-zinc-100 my-1" />
                  
                  <Item 
                    onClick={onProfileClick}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-lg hover:bg-zinc-50 focus:bg-zinc-50"
                  >
                    <User className="w-4 h-4 text-zinc-500" />
                    <span>My Profile</span>
                  </Item>

                  <Item 
                    onClick={onOrdersClick}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-lg hover:bg-zinc-50 focus:bg-zinc-50"
                  >
                    <ClipboardList className="w-4 h-4 text-zinc-500" />
                    <span>Order History</span>
                  </Item>
                  
                  <Item 
                    onClick={onLogout}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-700 hover:text-black cursor-pointer rounded-lg hover:bg-zinc-50 focus:bg-zinc-50"
                  >
                    <LogOut className="w-4 h-4 text-zinc-400" />
                    <span>Sign Out</span>
                  </Item>
                </Group>
              </Content>
            </Dropdown>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLoginClick}
                className="text-xs uppercase tracking-wider font-bold px-4 py-2 hover:bg-zinc-50 rounded-xl transition-colors"
              >
                Login
              </button>
              <button
                onClick={onSignUpClick}
                className="text-xs uppercase tracking-wider font-bold px-4 py-2 bg-black text-white hover:bg-zinc-800 rounded-xl transition-all shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  )
}
