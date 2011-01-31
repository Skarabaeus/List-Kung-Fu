class SessionsController < Devise::SessionsController

  def destroy
    super
    reset_session
  end
end
