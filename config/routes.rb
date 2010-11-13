ListKungFu::Application.routes.draw do
  root :to => "app#welcome"

  resources :lists do
    resources :list_items
  end
  
  resources :list_items
  
  devise_for :users
  
  get "app/main"
  get "app/welcome"

end
